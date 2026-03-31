-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: localhost    Database: performance_tracker
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `companies_company_name_unique` (`company_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (2,'Grace Garden',3,'2026-03-30 10:30:34','2026-03-30 10:30:34'),(3,'DAL UK',3,'2026-03-30 10:31:02','2026-03-30 10:31:02'),(4,'Kai Properties Ghana',3,'2026-03-30 10:31:54','2026-03-30 10:31:54'),(5,'Affordable Gh',3,'2026-03-30 10:32:09','2026-03-30 10:32:09'),(6,'Daddy Ash Ltd',3,'2026-03-30 10:32:31','2026-03-30 10:32:31');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_group_members`
--

DROP TABLE IF EXISTS `employer_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_group_members` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employer_group_id` bigint unsigned NOT NULL,
  `employer_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employer_group_members_employer_group_id_employer_id_unique` (`employer_group_id`,`employer_id`),
  KEY `employer_group_members_employer_id_foreign` (`employer_id`),
  CONSTRAINT `employer_group_members_employer_group_id_foreign` FOREIGN KEY (`employer_group_id`) REFERENCES `employer_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employer_group_members_employer_id_foreign` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_group_members`
--

LOCK TABLES `employer_group_members` WRITE;
/*!40000 ALTER TABLE `employer_group_members` DISABLE KEYS */;
INSERT INTO `employer_group_members` VALUES (1,1,1,NULL,NULL);
/*!40000 ALTER TABLE `employer_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employer_groups`
--

DROP TABLE IF EXISTS `employer_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employer_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `group_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `manager_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `employer_groups_manager_id_foreign` (`manager_id`),
  CONSTRAINT `employer_groups_manager_id_foreign` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employer_groups`
--

LOCK TABLES `employer_groups` WRITE;
/*!40000 ALTER TABLE `employer_groups` DISABLE KEYS */;
INSERT INTO `employer_groups` VALUES (1,'sales',4,'2026-03-31 07:25:37','2026-03-31 07:25:37');
/*!40000 ALTER TABLE `employer_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_resets_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2024_01_01_000001_add_role_company_team_to_users_table',1),(6,'2024_01_01_000002_create_companies_table',1),(7,'2024_01_01_000003_create_teams_table',1),(8,'2024_01_01_000004_create_tasks_table',1),(9,'2024_01_01_000005_create_reports_table',1),(10,'2024_01_01_000006_create_wins_table',1),(11,'2024_01_01_000007_create_notifications_table',1),(12,'2026_03_30_000008_create_notification_channel_settings_table',2),(13,'2026_03_30_000009_add_profile_fields_to_users_table',3),(14,'2026_03_30_000010_add_review_flow_fields_to_reports_table',4),(15,'2026_03_30_000011_add_review_fields_to_wins_table',5),(16,'2026_03_30_000012_add_membership_fields_to_users_table',6),(17,'2026_03_30_000013_create_notification_delivery_logs_table',7),(18,'2026_03_30_000014_create_task_attachments_table',8),(19,'2026_03_31_000015_create_employer_groups_table',9),(20,'2026_03_31_000009_add_app_logo_path_to_notification_channel_settings_table',10),(21,'2026_03_31_000010_add_app_name_to_notification_channel_settings_table',11);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_channel_settings`
--

DROP TABLE IF EXISTS `notification_channel_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_channel_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `app_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_host` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_port` int unsigned DEFAULT NULL,
  `smtp_encryption` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_password` text COLLATE utf8mb4_unicode_ci,
  `smtp_from_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `smtp_from_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arkesel_api_key` text COLLATE utf8mb4_unicode_ci,
  `arkesel_sender_id` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arkesel_api_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `app_logo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_channel_settings_updated_by_foreign` (`updated_by`),
  CONSTRAINT `notification_channel_settings_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_channel_settings`
--

LOCK TABLES `notification_channel_settings` WRITE;
/*!40000 ALTER TABLE `notification_channel_settings` DISABLE KEYS */;
INSERT INTO `notification_channel_settings` VALUES (1,'Daddy Ash Ltd','tacklehubs.tech',465,'ssl','daddyash@tacklehubs.tech','eyJpdiI6IjVJdjZkMVpLc1l3YXJNMjllM1h6OEE9PSIsInZhbHVlIjoiYVBuZWxacS9YcGt4SUlQeUs4V2lmR0pURGFnbGloRmxDNkhvVjJyOUNXST0iLCJtYWMiOiJhZDA0YmQyZTk3ZjBlMWFjMDE5NzczNWViMTUxMjQ1NzE0ZGNmZTViNGVhZjYyNDYxNmEwMWRkMTE3NmZjODhiIiwidGFnIjoiIn0=','daddyash@tacklehubs.tech','DaddyAsh Ltd','eyJpdiI6IlRtSmRUMXBOUEVPT1Y1WENMWjFjZEE9PSIsInZhbHVlIjoiQmcyQnZaUHhENzdZSXhwMDYrdzV0UFd0TGJ3b0Q4bXpWTHpCV2ttTSs5dz0iLCJtYWMiOiI0MzZiNmUwNThiMDU4Mzg4YjUwYWRmYTQyMDE0MmZkZTgxMzM5NTc3MGE5NGUyMmExYTliNzI5NjgxNTJmNzIyIiwidGFnIjoiIn0=','PSL','https://sms.arkesel.com/sms/api','app-branding/2EmBUI9UVjNaFWOMEn7aHGjWXLXa4jSrvNll8wdB.png',3,'2026-03-30 08:14:53','2026-03-31 08:38:43');
/*!40000 ALTER TABLE `notification_channel_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_delivery_logs`
--

DROP TABLE IF EXISTS `notification_delivery_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_delivery_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `notification_id` bigint unsigned DEFAULT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `meta` json DEFAULT NULL,
  `created_by` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_delivery_logs_user_id_foreign` (`user_id`),
  KEY `notification_delivery_logs_notification_id_foreign` (`notification_id`),
  KEY `notification_delivery_logs_created_by_foreign` (`created_by`),
  CONSTRAINT `notification_delivery_logs_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notification_delivery_logs_notification_id_foreign` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE SET NULL,
  CONSTRAINT `notification_delivery_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_delivery_logs`
--

LOCK TABLES `notification_delivery_logs` WRITE;
/*!40000 ALTER TABLE `notification_delivery_logs` DISABLE KEYS */;
INSERT INTO `notification_delivery_logs` VALUES (1,1,2,'email','sent','mediaedgegsm2005@gmail.com','New Task Assigned','Mr Hassan assigned you a new task: Testing App','smtp',NULL,'{\"notification_type\": \"task_assigned\"}',4,'2026-03-31 11:08:57','2026-03-31 11:08:57'),(2,1,2,'sms','sent','0244031434',NULL,'Mr Hassan assigned you a new task: Testing App','arkesel',NULL,'{\"notification_type\": \"task_assigned\"}',4,'2026-03-31 11:08:58','2026-03-31 11:08:58');
/*!40000 ALTER TABLE `notification_delivery_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unread',
  `type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,1,'Mr Hassan assigned you a new task: test test','read','task_assigned',14,'2026-03-31 09:48:35','2026-03-31 09:49:00'),(2,1,'Mr Hassan assigned you a new task: Testing App','read','task_assigned',15,'2026-03-31 11:08:53','2026-03-31 11:09:57');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  KEY `password_resets_email_index` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'auth_token','4066d7692df117c100da7cfcafdb8d9be2fad34f0400906d0967be73f4767833','[\"*\"]',NULL,'2026-03-30 02:45:08','2026-03-30 02:45:08'),(2,'App\\Models\\User',2,'auth_token','9866ce0c8b4e22a4a2294083983a29a1f13835727eaa9b4618a7cf2857f84182','[\"*\"]',NULL,'2026-03-30 02:45:16','2026-03-30 02:45:16'),(3,'App\\Models\\User',3,'auth_token','30e8188885fee2521513d5790f5db36560bf9e4b86d13a80c1a8d77c82cdc19f','[\"*\"]',NULL,'2026-03-30 02:48:41','2026-03-30 02:48:41'),(4,'App\\Models\\User',3,'auth_token','43d94bc56f0715064c27335b0a6b729b55a7766a875cd36758871ce4099871e4','[\"*\"]','2026-03-30 02:53:02','2026-03-30 02:53:02','2026-03-30 02:53:02'),(5,'App\\Models\\User',3,'auth_token','0528c26fde59feb454c0ac1e261507004586f29ce7db4f8788a1bfe9df7dfe84','[\"*\"]','2026-03-30 02:53:03','2026-03-30 02:53:03','2026-03-30 02:53:03'),(6,'App\\Models\\User',3,'auth_token','8cf2351ea9d74c3586e4e5179b34bbd252956824c3a6846c6621cc5238e76e8b','[\"*\"]','2026-03-30 02:53:20','2026-03-30 02:53:14','2026-03-30 02:53:20'),(7,'App\\Models\\User',3,'auth_token','f5b941b1a00c028aa62324c9f5313456147425946fda9f43925b8f239cf2cca5','[\"*\"]',NULL,'2026-03-30 02:55:49','2026-03-30 02:55:49'),(8,'App\\Models\\User',3,'auth_token','cef5fc5aacb7e0fb95df8127ac33c19e4a53bcedb6b3d339f8e3c15cd8d3558a','[\"*\"]','2026-03-30 03:22:34','2026-03-30 02:56:20','2026-03-30 03:22:34'),(9,'App\\Models\\User',3,'auth_token','5e7b01a0ea5d45c13b17b8c4fc5292c3c15b2e99d43bfd736835239952ccfecd','[\"*\"]','2026-03-30 03:34:20','2026-03-30 03:22:47','2026-03-30 03:34:20'),(10,'App\\Models\\User',3,'auth_token','2145f098a05782690e296f13b9aa5e060d98f06767d8be3aa38e55fb6a43a5fb','[\"*\"]','2026-03-30 08:43:07','2026-03-30 08:02:16','2026-03-30 08:43:07'),(11,'App\\Models\\User',4,'auth_token','ff90286a9860d8515ba25f78edf9d0b623c7648527c8a6f30fe49678e9004525','[\"*\"]','2026-03-30 09:11:30','2026-03-30 08:44:31','2026-03-30 09:11:30'),(12,'App\\Models\\User',3,'auth_token','44a08384a11a29e23667e640a21f462273373c81be1631306c21fd8031929584','[\"*\"]','2026-03-30 09:16:36','2026-03-30 09:12:02','2026-03-30 09:16:36'),(13,'App\\Models\\User',3,'auth_token','6f924a6402a38cced55cb645995f70ce62049a13a45a3a644f1c41dfc99601b7','[\"*\"]','2026-03-30 09:17:07','2026-03-30 09:17:07','2026-03-30 09:17:07'),(14,'App\\Models\\User',3,'auth_token','bde680880d29f0e1bb92e08103b13c720b7e8a4280fb4b7165bd5b2d9744bfe6','[\"*\"]','2026-03-30 10:32:35','2026-03-30 09:32:40','2026-03-30 10:32:35'),(15,'App\\Models\\User',3,'auth_token','4b3c9671e4b788401972031b17849a6b3c363e9a6d0d4e56f595831a5482c2cd','[\"*\"]','2026-03-30 10:36:58','2026-03-30 10:36:48','2026-03-30 10:36:58'),(16,'App\\Models\\User',4,'auth_token','cfe7f38775501742bfcfeca963e1b03e141cd8228c9f09f8e951d8fd03ec42c6','[\"*\"]','2026-03-30 10:37:20','2026-03-30 10:37:15','2026-03-30 10:37:20'),(17,'App\\Models\\User',3,'auth_token','c46523209607eac5b6ee37df3a0edb3a0498254a70a5e9ee2c91f4564c9dbe5d','[\"*\"]','2026-03-30 13:43:37','2026-03-30 10:37:27','2026-03-30 13:43:37'),(18,'App\\Models\\User',1,'auth_token','8f21e002a5e50a751d9765cfd1c72a14052d222d88e1ab24938d0d800c676545','[\"*\"]','2026-03-30 13:44:41','2026-03-30 13:43:47','2026-03-30 13:44:41'),(19,'App\\Models\\User',4,'auth_token','bd1015ae09ea7d1585ec0b944af6fbcc8d3ec9ba5640618ff1df1bca8b841006','[\"*\"]','2026-03-30 13:45:28','2026-03-30 13:45:13','2026-03-30 13:45:28'),(20,'App\\Models\\User',1,'auth_token','ebb977aa7264f819d573bb82f7c6103094b8f08746e89295ea429cbd889caa10','[\"*\"]','2026-03-30 13:46:20','2026-03-30 13:45:42','2026-03-30 13:46:20'),(21,'App\\Models\\User',1,'auth_token','92c928929df3773278817f8e1045053bfb523fef91679cf7cc4ffc2d382cf24a','[\"*\"]','2026-03-30 13:46:41','2026-03-30 13:46:41','2026-03-30 13:46:41'),(22,'App\\Models\\User',4,'auth_token','bf6e845a3001f3f47ee11436271172f84cd643c7aa3a878714f40ca0b91c7f8c','[\"*\"]','2026-03-30 13:46:54','2026-03-30 13:46:54','2026-03-30 13:46:54'),(23,'App\\Models\\User',1,'auth_token','c428a38fffbc9d299d113d6edfc02f8b3fda4b284d7e449037994196be858e1a','[\"*\"]','2026-03-30 13:47:29','2026-03-30 13:47:24','2026-03-30 13:47:29'),(24,'App\\Models\\User',4,'auth_token','c7232b01c55f8f8955946eb83c05bbd359e040968ca1625cfc687959202ce114','[\"*\"]','2026-03-30 13:56:01','2026-03-30 13:47:42','2026-03-30 13:56:01'),(25,'App\\Models\\User',1,'auth_token','0d6afeed8370b801f77ca8d17ba015e94886a290646da80762b79f71bdb680a4','[\"*\"]','2026-03-30 13:57:06','2026-03-30 13:56:21','2026-03-30 13:57:06'),(26,'App\\Models\\User',4,'auth_token','b0b3295ea1ef26d7c3f0b20980ba0a82d3b0ebd842b9d01a5ae93e8100ab9300','[\"*\"]','2026-03-30 13:57:49','2026-03-30 13:57:19','2026-03-30 13:57:49'),(27,'App\\Models\\User',1,'auth_token','079c0628484109a31cce7b159341d6854e5dd7267a0bd09f346d8b24bf14cf80','[\"*\"]','2026-03-30 13:58:49','2026-03-30 13:58:09','2026-03-30 13:58:49'),(28,'App\\Models\\User',4,'auth_token','8cbb75f6a6e51605cd68d19b93d9816a73bcfe2528cb238d5062242f69f7e023','[\"*\"]','2026-03-30 14:02:08','2026-03-30 14:00:19','2026-03-30 14:02:08'),(29,'App\\Models\\User',2,'auth_token','5682f8131a5d38dfd19b71a02825592f4a1cc19dc94cef3e93278636882f2f9f','[\"*\"]','2026-03-30 14:06:19','2026-03-30 14:02:24','2026-03-30 14:06:19'),(30,'App\\Models\\User',4,'auth_token','42ed279cfc3bf17c9950378887041e2e4f9f13557e4705c4001a503f0f68576f','[\"*\"]','2026-03-30 14:07:14','2026-03-30 14:06:55','2026-03-30 14:07:14'),(31,'App\\Models\\User',2,'auth_token','f6e4c0075a2c065717f550e556eb3ef51812549d9dff6ee465d16936f855cdab','[\"*\"]','2026-03-30 14:07:26','2026-03-30 14:07:20','2026-03-30 14:07:26'),(32,'App\\Models\\User',4,'auth_token','62dead8a3d10e875782c16780300a12db8b2cbb5ea4c23c187accc06252761fc','[\"*\"]','2026-03-30 14:07:52','2026-03-30 14:07:42','2026-03-30 14:07:52'),(33,'App\\Models\\User',1,'auth_token','1bd9428fa3b7d1c8261f4028ebf5a94e412af442f4997562333db4e99b90500d','[\"*\"]','2026-03-30 14:11:27','2026-03-30 14:08:16','2026-03-30 14:11:27'),(34,'App\\Models\\User',4,'auth_token','7a042d45ef2fde065a56781912011e6ef16ee731bf7014f982cd1844f0bb6e3c','[\"*\"]','2026-03-30 14:11:52','2026-03-30 14:11:40','2026-03-30 14:11:52'),(35,'App\\Models\\User',1,'auth_token','6fe73924a84a107d62a119c81d29b0a72150bba4293486ec39b8a6bdceeec84c','[\"*\"]','2026-03-30 14:16:52','2026-03-30 14:11:58','2026-03-30 14:16:52'),(36,'App\\Models\\User',4,'auth_token','ad1c0f9f82ca8abc8fb370f44d4f7a8676ba6d5bf2f4a5e669dfead88cf25b82','[\"*\"]','2026-03-30 14:20:25','2026-03-30 14:17:06','2026-03-30 14:20:25'),(37,'App\\Models\\User',1,'auth_token','9b91611d91478ff49b73b9ed1d08dd44dfa8a2a69018d7c0228b9e6a259bf9e9','[\"*\"]','2026-03-30 14:27:21','2026-03-30 14:20:47','2026-03-30 14:27:21'),(38,'App\\Models\\User',4,'auth_token','8ca6fb4955e1d388aed0b5e8a59924df5dc66bfdfe0ae32b086498553846fd34','[\"*\"]','2026-03-30 14:46:35','2026-03-30 14:27:44','2026-03-30 14:46:35'),(39,'App\\Models\\User',1,'auth_token','79b4ffe86cab7aa5040bda835c8439210646973059f0641434ccb77ae5f93697','[\"*\"]','2026-03-30 14:50:30','2026-03-30 14:49:45','2026-03-30 14:50:30'),(40,'App\\Models\\User',4,'auth_token','3ac6b3461fd102865ebe613555affbdc732901719c875983dd5662f84ec1ffe7','[\"*\"]','2026-03-30 15:35:21','2026-03-30 14:50:40','2026-03-30 15:35:21'),(41,'App\\Models\\User',1,'auth_token','98aafe8d74c2788d4a048bfd4e3f8cde35da80f3f3cf69546ae84a4fff5901d7','[\"*\"]','2026-03-30 16:11:24','2026-03-30 15:35:33','2026-03-30 16:11:24'),(42,'App\\Models\\User',4,'auth_token','e0688aab2e27c9a59dc54f90e1ae299e153da00c9d3fd2e15ae03e4d0d9d5219','[\"*\"]','2026-03-30 16:11:46','2026-03-30 16:11:43','2026-03-30 16:11:46'),(43,'App\\Models\\User',1,'auth_token','ce0cb12bde419f3214452c9677ab47047e23b139b6847345f60b7df5640a5953','[\"*\"]','2026-03-30 16:16:25','2026-03-30 16:12:41','2026-03-30 16:16:25'),(44,'App\\Models\\User',4,'auth_token','be99b069260850009648506490b0dbc09e0809e2f2eef93f68af38959cbde00a','[\"*\"]','2026-03-30 16:17:16','2026-03-30 16:16:55','2026-03-30 16:17:16'),(45,'App\\Models\\User',1,'auth_token','06601dc4a6a9abe5a34c2fe53242f5dcb1913cbf69a9b9d5b9ac3138ac5e297d','[\"*\"]','2026-03-30 16:18:13','2026-03-30 16:17:38','2026-03-30 16:18:13'),(46,'App\\Models\\User',4,'auth_token','387f1c563cc08797263ebb350b2701dcd1815ba1f1c68a30066abf09aadb55ff','[\"*\"]','2026-03-30 16:31:15','2026-03-30 16:18:35','2026-03-30 16:31:15'),(47,'App\\Models\\User',1,'auth_token','6b3d4fbd03b1c8d2dd12ccf8c1e36de1f8fba556f99639f4544f80c089f23de3','[\"*\"]','2026-03-30 16:32:10','2026-03-30 16:31:40','2026-03-30 16:32:10'),(48,'App\\Models\\User',4,'auth_token','12f82a9ea5d99adb3ba086304b2345a1b9926b782faa0f41ebd2993a85f9ffe9','[\"*\"]','2026-03-30 16:36:10','2026-03-30 16:32:23','2026-03-30 16:36:10'),(49,'App\\Models\\User',1,'auth_token','8466728e01cc6b6181baf27b5ff5dca9f492d645501b020b93360a0a208fa376','[\"*\"]','2026-03-30 16:43:55','2026-03-30 16:36:59','2026-03-30 16:43:55'),(50,'App\\Models\\User',4,'auth_token','ea4f02735ebdbf005dc351fbeb6d13bae03c3ee601be0575298efc2b3bd46850','[\"*\"]','2026-03-30 16:50:26','2026-03-30 16:44:54','2026-03-30 16:50:26'),(51,'App\\Models\\User',1,'auth_token','8563fcbd74a2533ae047060afc605310ccd36333ecbf55b2857b636fa6da546a','[\"*\"]','2026-03-30 17:02:28','2026-03-30 16:52:22','2026-03-30 17:02:28'),(52,'App\\Models\\User',4,'auth_token','9c66c7d1da00c293daa83b89f90c61a69a4a7720b3c775b7a226596e742231e4','[\"*\"]','2026-03-30 17:02:47','2026-03-30 17:02:36','2026-03-30 17:02:47'),(53,'App\\Models\\User',4,'auth_token','acc336ea1b4d55573b275e5271bad87d043feb69b9c3f1b0103b36eaa0cffcd7','[\"*\"]','2026-03-31 04:33:17','2026-03-30 17:03:00','2026-03-31 04:33:17'),(54,'App\\Models\\User',1,'auth_token','74362059715a61a1bf9de1822f0207930bfb8d1dee8a9bb382065a1050002b97','[\"*\"]','2026-03-31 04:38:24','2026-03-31 04:33:34','2026-03-31 04:38:24'),(55,'App\\Models\\User',4,'auth_token','ec3b45a7012de28ebd54df37b4fb18f30a8639ba879b8f24ec3a9db206648a90','[\"*\"]','2026-03-31 04:39:17','2026-03-31 04:38:48','2026-03-31 04:39:17'),(56,'App\\Models\\User',1,'auth_token','eba16bda08e78fe2af254ac3f9b668c6270f4f635f95651bf0115a928fb2a722','[\"*\"]','2026-03-31 04:40:06','2026-03-31 04:39:25','2026-03-31 04:40:06'),(57,'App\\Models\\User',4,'auth_token','4e3020b398d92347920ec417b49593075588455953c06b4351b117f869f9cf79','[\"*\"]','2026-03-31 04:44:12','2026-03-31 04:40:14','2026-03-31 04:44:12'),(58,'App\\Models\\User',4,'auth_token','206d4213f8bbabdc369f9e68ea8f8d13a924206263e206081bb37b715251de34','[\"*\"]','2026-03-31 04:51:19','2026-03-31 04:44:23','2026-03-31 04:51:19'),(59,'App\\Models\\User',3,'auth_token','f0d1891423175268007cf53513be2853973dcb068bae8bc92d747b657cc7854e','[\"*\"]','2026-03-31 04:58:33','2026-03-31 04:51:26','2026-03-31 04:58:33'),(60,'App\\Models\\User',4,'auth_token','da43417b6d3acac7f020132edaaf8d66437255005faa8996c0738a2c3799588d','[\"*\"]','2026-03-31 05:00:13','2026-03-31 04:58:46','2026-03-31 05:00:13'),(61,'App\\Models\\User',4,'auth_token','5da2717fe0f640aa41ec4fef46c92a88b33ce526e2b78895baec920136c13159','[\"*\"]','2026-03-31 05:02:06','2026-03-31 05:00:49','2026-03-31 05:02:06'),(62,'App\\Models\\User',1,'auth_token','2cb64a748a7e1b23755dbda28533a57c9694b8f06693f5af9ddced0c18ede8e8','[\"*\"]','2026-03-31 05:12:26','2026-03-31 05:02:45','2026-03-31 05:12:26'),(63,'App\\Models\\User',4,'auth_token','6d441f224b3cc9172ced3fcd9f59d309d89dd28e16553507593e27fbea760e7d','[\"*\"]','2026-03-31 05:13:13','2026-03-31 05:12:37','2026-03-31 05:13:13'),(64,'App\\Models\\User',4,'auth_token','6eba707a99261169943d744f7fa95fc4f73af39299f5385999bfe009a20388a5','[\"*\"]','2026-03-31 05:14:00','2026-03-31 05:13:18','2026-03-31 05:14:00'),(65,'App\\Models\\User',1,'auth_token','650942329fc84d41a49d8770739b9a1409cd35804c0621a1a7707560809b6574','[\"*\"]','2026-03-31 05:14:50','2026-03-31 05:14:08','2026-03-31 05:14:50'),(66,'App\\Models\\User',4,'auth_token','eb0fda3b1cb5aa5abd27b560b866d5280fdedc11895f19ada4f1520e9bc3d28c','[\"*\"]','2026-03-31 05:24:56','2026-03-31 05:14:59','2026-03-31 05:24:56'),(67,'App\\Models\\User',1,'auth_token','cc15ae3efb9138661d9a9f61c84f6998cae4118923e61e7489f998b8da933023','[\"*\"]','2026-03-31 05:37:27','2026-03-31 05:25:19','2026-03-31 05:37:27'),(68,'App\\Models\\User',4,'auth_token','18a14e929d7d6652fb30a0f7ea74563a9e000dfe84528eec900eec3617070610','[\"*\"]','2026-03-31 05:42:39','2026-03-31 05:37:46','2026-03-31 05:42:39'),(69,'App\\Models\\User',1,'auth_token','78e6ad72aad9ee5d6a4ff69cd4265e90c304f2f8ebc50c44ef34e27341f5178d','[\"*\"]','2026-03-31 05:43:21','2026-03-31 05:42:50','2026-03-31 05:43:21'),(70,'App\\Models\\User',4,'auth_token','fbab0bcc5b6c01859f46e9d0ad5abbbe867ce1ca99e1521967af36154ebb5887','[\"*\"]','2026-03-31 05:43:44','2026-03-31 05:43:29','2026-03-31 05:43:44'),(71,'App\\Models\\User',1,'auth_token','72fc76e4f5710548dad4776d5e905802bc0c831e827964874b62df986b3662a1','[\"*\"]','2026-03-31 05:44:52','2026-03-31 05:44:01','2026-03-31 05:44:52'),(72,'App\\Models\\User',2,'auth_token','5cb44b5855352a511c3c5a3bbb3d5ee0f8b9ff9f3c35e7712eb25fb9a9cd82c9','[\"*\"]','2026-03-31 05:57:52','2026-03-31 05:45:08','2026-03-31 05:57:52'),(73,'App\\Models\\User',1,'auth_token','2c3dcf19dd9f8fbb0b56606fe6c753c255d154e0acf9fee04e1511d1089e7362','[\"*\"]','2026-03-31 06:06:51','2026-03-31 06:02:27','2026-03-31 06:06:51'),(74,'App\\Models\\User',2,'auth_token','533fa411a232a6a03be3c2e26adae166e2e1ad8b331e78fcd20ba539233db308','[\"*\"]','2026-03-31 06:08:16','2026-03-31 06:07:53','2026-03-31 06:08:16'),(75,'App\\Models\\User',1,'auth_token','f8d883ad75292ec3fc145865a199dea0f96020330402604efb96ab29d8df73f0','[\"*\"]','2026-03-31 06:09:47','2026-03-31 06:08:57','2026-03-31 06:09:47'),(76,'App\\Models\\User',2,'auth_token','fa82aac1320e1844991340a9644261aef0082780ffe51f66c8ee61aaed165c47','[\"*\"]','2026-03-31 06:11:23','2026-03-31 06:09:53','2026-03-31 06:11:23'),(77,'App\\Models\\User',1,'auth_token','a11c0f4d7835f4d60b057af52df46936e7914dfb633a2968f283db3cd9ab2fae','[\"*\"]','2026-03-31 06:13:44','2026-03-31 06:13:16','2026-03-31 06:13:44'),(78,'App\\Models\\User',2,'auth_token','88d7e2ba1cbc3d28194c7d9711d09d1a692e0e440546091a7d4e61282d802501','[\"*\"]','2026-03-31 06:15:03','2026-03-31 06:14:18','2026-03-31 06:15:03'),(79,'App\\Models\\User',1,'auth_token','5a98f19678fbcb21692c884540b4b25ff6d93aa75b16138551007f69b375f670','[\"*\"]','2026-03-31 06:15:36','2026-03-31 06:15:15','2026-03-31 06:15:36'),(80,'App\\Models\\User',2,'auth_token','b82f13ad3a28b518d3da0a6750569281097467f5d7797fde356dfa9ffdba5efc','[\"*\"]','2026-03-31 06:16:37','2026-03-31 06:15:49','2026-03-31 06:16:37'),(81,'App\\Models\\User',1,'auth_token','f2e7899246f7b02959587cfa1c8db9c308d09ec2e5383de5dca983ef0c3a992b','[\"*\"]','2026-03-31 06:23:22','2026-03-31 06:16:58','2026-03-31 06:23:22'),(82,'App\\Models\\User',2,'auth_token','642620c5f3326b7a6fe13b8eb3cb7e9034d33edd1d145ccc16f133e6fae5bd59','[\"*\"]','2026-03-31 06:36:23','2026-03-31 06:24:03','2026-03-31 06:36:23'),(83,'App\\Models\\User',1,'auth_token','f97a0d5b020f4d6b238473914ef402d6d25571ed8311f0f515a2af14b4e2b500','[\"*\"]','2026-03-31 06:37:34','2026-03-31 06:36:43','2026-03-31 06:37:34'),(84,'App\\Models\\User',2,'auth_token','1217dee11d7c796aca8bdb837b47221861445fad70c64710f3631233ada91e56','[\"*\"]','2026-03-31 06:52:28','2026-03-31 06:37:57','2026-03-31 06:52:28'),(85,'App\\Models\\User',4,'auth_token','568f88adfd387dd0ce404708070bf9a50102668bb729ac7566366200cd503a08','[\"*\"]','2026-03-31 07:11:07','2026-03-31 06:53:05','2026-03-31 07:11:07'),(86,'App\\Models\\User',1,'auth_token','10872f2ccb88d8173a52c084f41fd660f8fcde7414b50e3e0e68972bd90ffb05','[\"*\"]','2026-03-31 07:20:33','2026-03-31 07:11:20','2026-03-31 07:20:33'),(87,'App\\Models\\User',4,'auth_token','76bb66778dc769f1f3bd4e7872be0578086386fccd0bed0354c0cc8466b0295d','[\"*\"]','2026-03-31 07:31:03','2026-03-31 07:21:31','2026-03-31 07:31:03'),(88,'App\\Models\\User',4,'auth_token','bc56c828e33dedba00c7395bacb59d3182b4199383c4c3b46b1f44d57b867f22','[\"*\"]','2026-03-31 07:35:51','2026-03-31 07:31:28','2026-03-31 07:35:51'),(89,'App\\Models\\User',3,'auth_token','dc937e6e3f8ede706a030800602e563d1072e5d1ab97e8ad447bde3c75ed60a7','[\"*\"]','2026-03-31 08:04:20','2026-03-31 07:39:43','2026-03-31 08:04:20'),(90,'App\\Models\\User',3,'auth_token','b61f1ee27b5c7a387d1857c30f8e72bc9c25f86531c16ad29c1a4061495d89ad','[\"*\"]','2026-03-31 08:27:01','2026-03-31 08:27:01','2026-03-31 08:27:01'),(91,'App\\Models\\User',4,'auth_token','a81f4fd2adb0f8642dcef3252444c11f4f5000c54a1f2f8cca1684b2a2e16302','[\"*\"]','2026-03-31 08:28:24','2026-03-31 08:28:08','2026-03-31 08:28:24'),(92,'App\\Models\\User',3,'auth_token','d2759c4b96f924d8110246238b36d135143018fab7958083d596bfa717a428b7','[\"*\"]','2026-03-31 08:38:44','2026-03-31 08:29:04','2026-03-31 08:38:44'),(93,'App\\Models\\User',2,'auth_token','c70a020b9ee96e1235b947ef70588ac5a1cdbae6aa3b0909d89dfa5b139c90b0','[\"*\"]','2026-03-31 08:59:24','2026-03-31 08:51:50','2026-03-31 08:59:24'),(94,'App\\Models\\User',4,'auth_token','4023d2ca5b3f6da5d2eeedee5942e06b0ec8257da2b6fa663aa0826a58b30554','[\"*\"]','2026-03-31 09:45:55','2026-03-31 08:59:34','2026-03-31 09:45:55'),(95,'App\\Models\\User',1,'auth_token','5d225a38c1f64aaff1a48bd5f0b6c0068c8a0bae1cbd2bff9d00eed2f52fa86d','[\"*\"]','2026-03-31 11:01:49','2026-03-31 09:46:18','2026-03-31 11:01:49'),(96,'App\\Models\\User',4,'auth_token','5525e764781494261746403c247ce0d568bb377e98e586989a854a4238882ebd','[\"*\"]','2026-03-31 11:03:43','2026-03-31 09:46:31','2026-03-31 11:03:43'),(97,'App\\Models\\User',3,'auth_token','3fed18be48d0aedadc77e88dadf2a7d8b742e5ec27a83e9e5ae98d82edab0475','[\"*\"]','2026-03-31 11:06:21','2026-03-31 11:03:51','2026-03-31 11:06:21'),(98,'App\\Models\\User',1,'auth_token','8fd983056bfd6d959d85109d1b9167340a3c30f73ab24f4d51288cab001d70ad','[\"*\"]','2026-03-31 11:16:43','2026-03-31 11:06:13','2026-03-31 11:16:43'),(99,'App\\Models\\User',4,'auth_token','311a6a78b4c982ffa3ce30d7801927f2ce1b8459148fb7179aba3ebbc75717a1','[\"*\"]','2026-03-31 11:16:43','2026-03-31 11:06:27','2026-03-31 11:16:43');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint unsigned NOT NULL,
  `reviewer_id` bigint unsigned DEFAULT NULL,
  `response_by` bigint unsigned DEFAULT NULL,
  `report_date` date NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `work_done` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `challenges` text COLLATE utf8mb4_unicode_ci,
  `wins` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `response_comment` text COLLATE utf8mb4_unicode_ci,
  `responded_at` timestamp NULL DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_employee_id_foreign` (`employee_id`),
  KEY `reports_reviewer_id_foreign` (`reviewer_id`),
  KEY `reports_response_by_foreign` (`response_by`),
  CONSTRAINT `reports_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_response_by_foreign` FOREIGN KEY (`response_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reports_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (5,2,1,1,'2026-03-17','Call to undefined relationship [task] on model [App\\Models\\Win].','Call to undefined relationship [task] on model [App\\Models\\Win].','Call to undefined relationship [task] on model [App\\Models\\Win].','Call to undefined relationship [task] on model [App\\Models\\Win].','approved',NULL,'2026-03-31 06:17:22','[\"http://localhost/storage/report-attachments/u4YzbPeqtSTmr6R97EMGRBUBDTCKFyY0qDOLZlPD.pdf\"]','2026-03-31 06:16:37','2026-03-31 06:17:22');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_attachments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `task_id` bigint unsigned NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `task_attachments_task_id_index` (`task_id`),
  CONSTRAINT `task_attachments_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachments`
--

LOCK TABLES `task_attachments` WRITE;
/*!40000 ALTER TABLE `task_attachments` DISABLE KEYS */;
INSERT INTO `task_attachments` VALUES (11,11,'Oware-Dweteh.png','task-attachments/AirwcUWWyvQv7RLSCvhCFhD2snCPsP4xQKQb23cH.png','image/png',1963603,'2026-03-31 05:02:06','2026-03-31 05:02:06'),(12,11,'SOD.pdf','task-attachments/ToZITdBRpMIHs9FYUzMNf8LVlhyaznyLLZ8FmRHO.pdf','application/pdf',494901,'2026-03-31 05:14:50','2026-03-31 05:14:50'),(13,12,'Oware-Dweteh Invitation.pdf','task-attachments/wB7KQXwF8hKhXHd97tvRYujRyLfvtNF3ZLM0XfHT.pdf','application/pdf',139197,'2026-03-31 06:03:07','2026-03-31 06:03:07'),(14,12,'STEPHEN KWASI OWARE-DWETEH.jpg','task-attachments/6mN9VMimhZ4lCsxCqUAZA6ERdNQFZK1q5kfzduck.jpg','image/jpeg',39290,'2026-03-31 06:08:15','2026-03-31 06:08:15'),(15,13,'SOD.pdf','task-attachments/QduZ0BV90Qefice2PzpeIWwi6tzqymh5xtk871Pd.pdf','application/pdf',494901,'2026-03-31 06:13:44','2026-03-31 06:13:44'),(16,14,'LETTER OF AUTHORIZATION .docx','task-attachments/j76G1JGTEowoOGRfYBmPCLrQne6PyRBdQEy3Yemi.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',1868565,'2026-03-31 09:48:35','2026-03-31 09:48:35'),(17,15,'OWARE DWETEH.pdf','task-attachments/AYos5ycB3bQosXSrIf3XVZFz9vSXjJTJIUnjWadw.pdf','application/pdf',223099,'2026-03-31 11:08:53','2026-03-31 11:08:53');
/*!40000 ALTER TABLE `task_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `assigned_to` bigint unsigned NOT NULL,
  `created_by` bigint unsigned NOT NULL,
  `team_id` bigint unsigned DEFAULT NULL,
  `start_date` date NOT NULL,
  `due_date` date NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `priority` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_assigned_to_foreign` (`assigned_to`),
  KEY `tasks_created_by_foreign` (`created_by`),
  CONSTRAINT `tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (11,'Jennifer Test','Free hardened images give every developer a trusted starting point, with enterprise options for SLAs, compliance, and extended lifecycle security.\n\nSubmission Note (Test Employer 1 - 2026-03-31 05:14)\nFree hardened images give every developer a trusted starting point, with enterprise options for SLAs, compliance, and extended lifecycle security.',1,4,NULL,'2026-03-10','2026-03-10','completed','medium','2026-03-31 05:02:06','2026-03-31 05:24:02'),(12,'Jennifer','Call to undefined relationship [task] on model [App\\Models\\Win].\n\nSubmission Note (Test Employee 1 - 2026-03-31 06:08)\nCall to undefined relationship [task] on model [App\\Models\\Win].',2,1,NULL,'2026-03-11','2026-03-13','completed','medium','2026-03-31 06:03:07','2026-03-31 06:09:47'),(13,'askos','Call to undefined relationship [task] on model [App\\Models\\Win].\n\nSubmission Note (Test Employee 1 - 2026-03-31 06:14)\nCall to undefined relationship [task] on model [App\\Models\\Win].\n\nSubmission Note (Test Employee 1 - 2026-03-31 06:15)\nCall to undefined relationship [task] on model [App\\Models\\Win].',2,1,NULL,'2026-03-12','2026-03-19','completed','medium','2026-03-31 06:13:44','2026-03-31 06:15:24'),(14,'test test','tdxdx gdvgdwvc gvdvcwgd',1,4,NULL,'2026-03-05','2026-03-13','pending','critical','2026-03-31 09:48:35','2026-03-31 09:48:35'),(15,'Testing App','Tomorrow is the big day! 🎉\r\nYour Virtual Open House at Audencia is happening on April 1st, from 2:00 PM to 6:00 PM (CEST)—get ready to explore your future online, live, and in real time.',1,4,NULL,'2026-03-04','2026-03-11','pending','critical','2026-03-31 11:08:53','2026-03-31 11:08:53');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `team_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teams_company_id_foreign` (`company_id`),
  CONSTRAINT `teams_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'test team',6,'2026-03-31 07:17:22','2026-03-31 07:17:22');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `profile_photo_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `membership_status` enum('pending','accepted','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'accepted',
  `company_id` bigint unsigned DEFAULT NULL,
  `team_id` bigint unsigned DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test Employer 1','mediaedgegsm2005@gmail.com','0244031434',NULL,NULL,'employer','accepted',6,NULL,NULL,'$2y$10$M9O.RRLHFiCil6PvEdH4Juh5wsPeW650/ZMA2.FvkX3XQlZWBP76W',NULL,'2026-03-30 02:45:08','2026-03-31 11:05:32'),(2,'Test Employee 1','dwetehkuru@gmail.com',NULL,NULL,NULL,'employee','accepted',6,1,NULL,'$2y$10$AGH4e3ZQ.COnDsmEpbEO6uyWDq3H6n9MMLZE94GczvLbP.AOiZ2gm',NULL,'2026-03-30 02:45:16','2026-03-31 11:04:52'),(3,'Super Admin','stephendweteh@gmail.com','0551327000',NULL,'profile-photos/jTqthunZq1I6kpqg4N8kGZMXk4GdrEbXlNZklZIW.jpg','super_admin','accepted',NULL,NULL,NULL,'$2y$10$GxD130DcOdxEnhtW0qwIsO.mx4DVSXWDClpiC9s/JfbXhk6YEP.ou',NULL,'2026-03-30 02:48:34','2026-03-30 09:16:35'),(4,'Mr Hassan','hassan@daddyash.com',NULL,NULL,NULL,'manager','accepted',NULL,NULL,NULL,'$2y$10$eB/BDqE75Jp5inVdAnwJUO8ZXWYW8ABy0THc0E4kJ/GEh6bIqrmwO',NULL,'2026-03-30 08:43:07','2026-03-30 08:43:07');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wins`
--

DROP TABLE IF EXISTS `wins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wins` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employee_id` bigint unsigned NOT NULL,
  `reviewer_id` bigint unsigned DEFAULT NULL,
  `response_by` bigint unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `score` tinyint unsigned DEFAULT NULL,
  `response_comment` text COLLATE utf8mb4_unicode_ci,
  `responded_at` timestamp NULL DEFAULT NULL,
  `date` date NOT NULL,
  `task_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wins_employee_id_foreign` (`employee_id`),
  KEY `wins_reviewer_id_foreign` (`reviewer_id`),
  KEY `wins_response_by_foreign` (`response_by`),
  CONSTRAINT `wins_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wins_response_by_foreign` FOREIGN KEY (`response_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `wins_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wins`
--

LOCK TABLES `wins` WRITE;
/*!40000 ALTER TABLE `wins` DISABLE KEYS */;
INSERT INTO `wins` VALUES (1,1,4,4,'gvbg','Free hardened images give every developer a trusted starting point, with enterprise options for SLAs, compliance, and extended lifecycle security.','reviewed',2,NULL,'2026-03-31 05:42:37','2026-03-02',NULL,'2026-03-31 05:26:27','2026-03-31 05:42:37'),(2,1,4,4,'Jennifer','Record Achievement','reviewed',4,NULL,'2026-03-31 05:42:11','2026-03-11',NULL,'2026-03-31 05:36:00','2026-03-31 05:42:11'),(3,1,4,4,'bjb','Call to undefined relationship [task] on model [App\\Models\\Win].','reviewed',4,'Call to undefined relationship [task] on model [App\\Models\\Win].','2026-03-31 05:43:43','2026-03-11',NULL,'2026-03-31 05:43:21','2026-03-31 05:43:43'),(4,2,1,1,'mama','Tasks Tasks Tasks Tasks Tasks Tasks','reviewed',4,NULL,'2026-03-31 06:37:34','2026-03-11',NULL,'2026-03-31 06:36:23','2026-03-31 06:37:34');
/*!40000 ALTER TABLE `wins` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-31 11:16:46
