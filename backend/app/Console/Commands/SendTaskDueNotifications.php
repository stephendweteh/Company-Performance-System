<?php

namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendTaskDueNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tasks:notify-due {--date= : Send notifications for tasks due on a specific YYYY-MM-DD date}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send unread due-date notifications for tasks that are due and not yet completed';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $targetDate = $this->option('date')
            ? Carbon::parse($this->option('date'))->startOfDay()
            : now()->startOfDay();

        $tasks = Task::with('assignee')
            ->whereDate('due_date', $targetDate->toDateString())
            ->where('status', '!=', Task::STATUS_COMPLETED)
            ->get();

        $createdCount = 0;

        foreach ($tasks as $task) {
            if (!$task->assignee) {
                continue;
            }

            $alreadySent = Notification::query()
                ->where('user_id', $task->assignee->id)
                ->where('type', Notification::TYPE_TASK_DUE)
                ->where('related_id', $task->id)
                ->whereDate('created_at', $targetDate->toDateString())
                ->exists();

            if ($alreadySent) {
                continue;
            }

            Notification::create([
                'user_id' => $task->assignee->id,
                'message' => 'Task "' . $task->title . '" is due today.',
                'status' => Notification::STATUS_UNREAD,
                'type' => Notification::TYPE_TASK_DUE,
                'related_id' => $task->id,
            ]);

            $createdCount++;
        }

        $this->info('Created ' . $createdCount . ' due notification(s) for ' . $targetDate->toDateString() . '.');

        return self::SUCCESS;
    }
}
