CREATE DATABASE  IF NOT EXISTS `land-tax` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `land-tax`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: land-tax
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `citizen_id` int NOT NULL,
  `role_id` int NOT NULL,
  `account_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `status_note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`account_id`),
  KEY `citizen_id` (`citizen_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES (1,1,2,'ACTIVE',NULL),(2,2,3,'ACTIVE',NULL),(3,3,4,'ACTIVE',NULL),(4,4,1,'ACTIVE',NULL),(5,5,2,'ACTIVE',NULL),(6,6,2,'ACTIVE',NULL),(7,7,2,'ACTIVE',NULL),(8,8,2,'ACTIVE',NULL),(9,9,2,'ACTIVE',NULL),(10,10,2,'ACTIVE',NULL),(11,11,1,'ACTIVE',NULL),(12,12,3,'ACTIVE',NULL),(13,13,4,'ACTIVE',NULL),(14,14,1,'ACTIVE',NULL),(15,15,2,'ACTIVE',NULL),(16,16,3,'ACTIVE',NULL),(17,17,4,'ACTIVE',NULL),(18,11,2,'ACTIVE',NULL),(19,4,2,'ACTIVE',NULL),(20,14,2,'ACTIVE',NULL),(21,16,2,'ACTIVE',NULL),(22,17,2,'ACTIVE',NULL),(23,12,2,'ACTIVE',NULL),(24,13,2,'ACTIVE',NULL),(25,19,2,'ACTIVE',NULL),(26,3,2,'ACTIVE',NULL),(27,2,2,'ACTIVE',NULL);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `area_id` int NOT NULL AUTO_INCREMENT,
  `district_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ward_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `street_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_level` int NOT NULL,
  `land_quota` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`area_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,'D01','W01','Phố Huế',1,100.00),(2,'D01','W02','Hàng Bài',1,100.00),(3,'D02','W03','Kim Mã',2,120.00),(4,'D02','W04','Đội Cấn',2,120.00),(5,'D03','W05','Dịch Vọng',3,150.00),(6,'D03','W06','Mai Dịch',3,150.00),(7,'D04','W07','Nguyễn Trãi',4,180.00),(8,'D04','W08','Khương Trung',4,180.00),(9,'D05','W09','Tây Mỗ',4,200.00),(10,'D05','W10','Mễ Trì',4,200.00),(11,'D01','W_THANH_LIET','Nguyễn Xiển',1,100.00),(12,'D01','W_THANH_LIET','Kim Giang',1,100.00),(13,'D01','W_THANH_LIET','Nghiêm Xuân Yêm',1,100.00),(14,'D01','W_THANH_LIET','Phan Trọng Tuệ',2,100.00),(15,'D01','W_THANH_LIET','Khu đồng Vực',3,100.00),(16,'D01','W_THANH_LIET','Cầu Bươu',2,100.00),(17,'D01','W_THANH_LIET','Tựu Liệt',3,100.00);
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citizen_local`
--

DROP TABLE IF EXISTS `citizen_local`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citizen_local` (
  `citizen_id` int NOT NULL AUTO_INCREMENT,
  `cccd_number` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`citizen_id`),
  UNIQUE KEY `cccd_number` (`cccd_number`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citizen_local`
--

LOCK TABLES `citizen_local` WRITE;
/*!40000 ALTER TABLE `citizen_local` DISABLE KEYS */;
INSERT INTO `citizen_local` VALUES (1,'079090012345','Le Hai Dang (Admin)','0911223344','dang.lh@mock.vn'),(2,'079090000003','Cán bộ Thuế','0912000003','tax.officer@mock.vn'),(3,'079090000002','Cán bộ địa chính','0912000002','land.officer@mock.vn'),(4,'001099012345','Nguyen Van Binh (Citizen)','0912999888','binh.nv@mock.vn'),(5,'001201000011','Lý Nhã Kỳ','0922000011','ky.ly@mock.vn'),(6,'001122334456','Phạm Xuân Ẩn','0933111222','an.px@citizen.vn'),(7,'001122334457','Vũ Trọng Phụng','0944111222','phung.vt@citizen.vn'),(8,'001122334458','Hồ Xuân Hương','0955111222','huong.hx@citizen.vn'),(9,'001122334459','Đinh Bộ Lĩnh','0966111222','linh.db@citizen.vn'),(10,'001122334460','Trần Hưng Đạo','0977111222','dao.th@citizen.vn'),(11,'000000000000','Admin Mới','0900000000','admin.moi@mock.vn'),(12,'012345678901','Nguyễn Văn Thuế','0988777666','thue.nv@mock.vn'),(13,'012345678902','Trần Thị Địa','0988777555','dia.tt@mock.vn'),(14,'010000000001','Nguyễn Quản Trị','0988111001','tien06062004t@gmail.com'),(15,'010000000002','Trần Công Dân','0988111002','citizen.new@mock.vn'),(16,'010000000003','Lê Cán Bộ Thuế','0988111003','tax.new@mock.vn'),(17,'010000000004','Phạm Địa Chính','0988111004','land.new@mock.vn'),(19,'079090000001','System Admin',NULL,'admin@vneid.gov.vn');
/*!40000 ALTER TABLE `citizen_local` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `complaints`
--

DROP TABLE IF EXISTS `complaints`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `complaints` (
  `complaint_id` int NOT NULL AUTO_INCREMENT,
  `citizen_id` int NOT NULL,
  `record_id` int DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `response_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`complaint_id`),
  KEY `fk_complaint_citizen` (`citizen_id`),
  KEY `fk_complaint_record` (`record_id`),
  CONSTRAINT `fk_complaint_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_complaint_record` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `complaints`
--

LOCK TABLES `complaints` WRITE;
/*!40000 ALTER TABLE `complaints` DISABLE KEYS */;
INSERT INTO `complaints` VALUES (9,5,13,'[Khiếu nại về thuế đất đai] - tại sao ','RESOLVED',NULL,'2026-05-28 07:39:41','2026-05-28 08:06:16'),(10,5,18,'[Phản ánh về hồ sơ đất đai] - test','PENDING',NULL,'2026-06-01 05:26:36','2026-06-01 05:26:36'),(11,5,2,'[Khiếu nại về số tiền thuế đất đai] - thuế','PENDING',NULL,'2026-06-01 05:27:15','2026-06-01 05:27:15'),(12,5,9,'[Khiếu nại về quyết định thuế] - abc','PENDING',NULL,'2026-06-01 06:02:53','2026-06-01 06:02:53');
/*!40000 ALTER TABLE `complaints` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `land_owners`
--

DROP TABLE IF EXISTS `land_owners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `land_owners` (
  `ownership_id` int NOT NULL AUTO_INCREMENT,
  `citizen_id` int NOT NULL,
  `land_parcel_id` int NOT NULL,
  `ownership_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownership_percentage` decimal(5,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ownership_id`),
  KEY `citizen_id` (`citizen_id`),
  KEY `land_parcel_id` (`land_parcel_id`),
  CONSTRAINT `land_owners_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  CONSTRAINT `land_owners_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `land_owners`
--

LOCK TABLES `land_owners` WRITE;
/*!40000 ALTER TABLE `land_owners` DISABLE KEYS */;
INSERT INTO `land_owners` VALUES (1,4,1,'MAIN',NULL,1,'2026-05-20 16:47:09'),(2,5,2,'MAIN',NULL,1,'2026-05-20 16:47:09'),(3,6,3,'MAIN',NULL,1,'2026-05-20 16:47:09'),(4,7,4,'MAIN',NULL,1,'2026-05-20 16:47:09'),(5,8,5,'MAIN',NULL,1,'2026-05-20 16:47:09'),(6,9,6,'MAIN',NULL,1,'2026-05-20 16:47:09'),(7,10,7,'MAIN',NULL,1,'2026-05-20 16:47:09'),(8,4,8,'MAIN',NULL,1,'2026-05-20 16:47:09'),(9,5,9,'MAIN',NULL,1,'2026-05-20 16:47:09'),(10,6,10,'MAIN',NULL,1,'2026-05-20 16:47:09');
/*!40000 ALTER TABLE `land_owners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `land_parcels`
--

DROP TABLE IF EXISTS `land_parcels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `land_parcels` (
  `land_parcel_id` int NOT NULL AUTO_INCREMENT,
  `land_type_id` int NOT NULL,
  `area_id` int NOT NULL,
  `parcel_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `map_sheet_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `area_size` decimal(10,2) NOT NULL,
  `usage_duration` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usage_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usage_origin` text COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `certificate_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gcn_book_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `attached_house` text COLLATE utf8mb4_unicode_ci,
  `attached_other` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`land_parcel_id`),
  KEY `land_type_id` (`land_type_id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `land_parcels_ibfk_1` FOREIGN KEY (`land_type_id`) REFERENCES `land_types` (`land_type_id`),
  CONSTRAINT `land_parcels_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`)
) ENGINE=InnoDB AUTO_INCREMENT=949 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `land_parcels`
--

LOCK TABLES `land_parcels` WRITE;
/*!40000 ALTER TABLE `land_parcels` DISABLE KEYS */;
INSERT INTO `land_parcels` VALUES (1,1,1,'101','01',85.50,'50 năm','Đất ở đô thị','Nhà nước giao đất có thu tiền','Số 10 Phố Huế','CH12345678','CS1001',NULL,'Nhà cấp 4, 30m2','Tường rào kiên cố'),(2,1,3,'205','05',120.00,NULL,NULL,NULL,'Số 20 Kim Mã',NULL,NULL,NULL,NULL,NULL),(3,1,5,'308','12',200.00,NULL,NULL,NULL,'Số 5 Dịch Vọng',NULL,NULL,NULL,NULL,NULL),(4,2,9,'412','20',350.00,NULL,NULL,NULL,'Tây Mỗ',NULL,NULL,NULL,NULL,NULL),(5,3,9,'550','21',1500.00,NULL,NULL,NULL,'Cánh đồng Tây Mỗ',NULL,NULL,NULL,NULL,NULL),(6,1,2,'102','01',60.00,NULL,NULL,NULL,'Số 15 Hàng Bài',NULL,NULL,NULL,NULL,NULL),(7,1,4,'206','05',90.00,NULL,NULL,NULL,'Số 30 Đội Cấn',NULL,NULL,NULL,NULL,NULL),(8,1,6,'309','12',150.00,'Lâu dài','Đất trồng cây lâu năm','Được thừa kế','Số 8 Mai Dịch','CH88888888','CS2002',NULL,'Nhà 2 tầng, 80m2','Bể bơi mini'),(9,9,1,'888','02',500.00,NULL,NULL,NULL,'Tòa nhà Phố Huế','CH12345','CS1032',NULL,NULL,NULL),(10,4,10,'999','25',1000.00,NULL,NULL,NULL,'Mễ Trì',NULL,NULL,NULL,NULL,NULL),(11,1,1,'106','16',150.00,NULL,NULL,NULL,'456 Nguyen Hue',NULL,NULL,NULL,NULL,NULL),(12,1,1,'106','16',150.00,NULL,NULL,NULL,'456 Nguyen Hue',NULL,NULL,NULL,NULL,NULL),(929,9,6,'321','321',321.00,NULL,NULL,NULL,'321',NULL,NULL,NULL,NULL,NULL),(930,10,10,'321','32',321.00,NULL,NULL,NULL,'321',NULL,NULL,NULL,NULL,NULL),(931,1,11,'125','18',150.50,'Lâu dài','Riêng',NULL,'Số 12 đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 123456','CS01892',NULL,NULL,NULL),(932,1,11,'126','18',80.00,'Lâu dài','Riêng',NULL,'Số 14 đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 123457','CS01893',NULL,NULL,NULL),(933,1,12,'77','09',240.75,'Lâu dài','Chung',NULL,'Số 210 đường Kim Giang, phường Thanh Liệt, Hà Nội','CV 200118','CS02011',NULL,NULL,NULL),(934,11,13,'301','22',1200.00,'Lâu dài','Riêng',NULL,'Lô A2 đường Nghiêm Xuân Yêm, phường Thanh Liệt, Hà Nội','CV 305512','CS03120',NULL,NULL,NULL),(935,1,14,'58','07',95.20,'Lâu dài','Riêng',NULL,'Số 8 đường Phan Trọng Tuệ, phường Thanh Liệt, Hà Nội','CV 410023','CS04077',NULL,NULL,NULL),(936,3,15,'410','31',5000.00,'Lâu dài','Chung',NULL,'Khu đồng Vực, phường Thanh Liệt, Hà Nội','CV 415590','CS04188',NULL,NULL,NULL),(937,1,16,'129','18',112.30,'Lâu dài','Riêng',NULL,'Số 20 đường Cầu Bươu, phường Thanh Liệt, Hà Nội','CV 123460','CS01896',NULL,NULL,NULL),(938,1,17,'82','09',64.00,'Lâu dài','Riêng',NULL,'Ngõ 15 Tựu Liệt, phường Thanh Liệt, Hà Nội','CV 200125','CS02018',NULL,NULL,NULL),(939,1,11,'999_TEST','99',150.00,'Lâu dài','Riêng',NULL,'Thửa Test Thanh Toán, đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 999999','CS09999',NULL,NULL,NULL),(940,1,11,'125','18',150.50,'Lâu dài','Riêng',NULL,'Số 12 đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 123456','CS01892',NULL,NULL,NULL),(941,1,11,'126','18',80.00,'Lâu dài','Riêng',NULL,'Số 14 đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 123457','CS01893',NULL,NULL,NULL),(942,1,12,'77','09',240.75,'Lâu dài','Chung',NULL,'Số 210 đường Kim Giang, phường Thanh Liệt, Hà Nội','CV 200118','CS02011',NULL,NULL,NULL),(943,11,13,'301','22',1200.00,'Lâu dài','Riêng',NULL,'Lô A2 đường Nghiêm Xuân Yêm, phường Thanh Liệt, Hà Nội','CV 305512','CS03120',NULL,NULL,NULL),(944,1,14,'58','07',95.20,'Lâu dài','Riêng',NULL,'Số 8 đường Phan Trọng Tuệ, phường Thanh Liệt, Hà Nội','CV 410023','CS04077',NULL,NULL,NULL),(945,3,15,'410','31',5000.00,'Lâu dài','Chung',NULL,'Khu đồng Vực, phường Thanh Liệt, Hà Nội','CV 415590','CS04188',NULL,NULL,NULL),(946,1,16,'129','18',112.30,'Lâu dài','Riêng',NULL,'Số 20 đường Cầu Bươu, phường Thanh Liệt, Hà Nội','CV 123460','CS01896',NULL,NULL,NULL),(947,1,17,'82','09',64.00,'Lâu dài','Riêng',NULL,'Ngõ 15 Tựu Liệt, phường Thanh Liệt, Hà Nội','CV 200125','CS02018',NULL,NULL,NULL),(948,1,11,'999_TEST','99',150.00,'Lâu dài','Riêng',NULL,'Thửa Test Thanh Toán, đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội','CV 999999','CS09999',NULL,NULL,NULL);
/*!40000 ALTER TABLE `land_parcels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `land_prices`
--

DROP TABLE IF EXISTS `land_prices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `land_prices` (
  `price_id` int NOT NULL AUTO_INCREMENT,
  `land_type_id` int NOT NULL,
  `area_id` int NOT NULL,
  `unit_price` decimal(18,2) NOT NULL,
  `applied_from` date NOT NULL,
  PRIMARY KEY (`price_id`),
  KEY `land_type_id` (`land_type_id`),
  KEY `area_id` (`area_id`),
  CONSTRAINT `land_prices_ibfk_1` FOREIGN KEY (`land_type_id`) REFERENCES `land_types` (`land_type_id`),
  CONSTRAINT `land_prices_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `land_prices`
--

LOCK TABLES `land_prices` WRITE;
/*!40000 ALTER TABLE `land_prices` DISABLE KEYS */;
INSERT INTO `land_prices` VALUES (1,1,1,100000000.00,'2026-01-01'),(2,1,3,80000000.00,'2026-01-01'),(3,1,5,50000000.00,'2026-01-01'),(4,2,9,20000000.00,'2026-01-01'),(5,3,9,500000.00,'2026-01-01'),(6,1,2,95000000.00,'2026-01-01'),(7,1,4,75000000.00,'2026-01-01'),(8,1,6,48000000.00,'2026-01-01'),(9,9,1,120000000.00,'2026-01-01'),(10,4,10,1500000.00,'2026-01-01');
/*!40000 ALTER TABLE `land_prices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `land_types`
--

DROP TABLE IF EXISTS `land_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `land_types` (
  `land_type_id` int NOT NULL AUTO_INCREMENT,
  `type_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_tax_payment` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`land_type_id`),
  UNIQUE KEY `type_code` (`type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `land_types`
--

LOCK TABLES `land_types` WRITE;
/*!40000 ALTER TABLE `land_types` DISABLE KEYS */;
INSERT INTO `land_types` VALUES (1,'ODT','Đất ở tại đô thị',1),(2,'ONT','Đất ở tại nông thôn',1),(3,'LUK','Đất chuyên trồng lúa nước',1),(4,'CLN','Đất trồng cây lâu năm',1),(5,'BHK','Đất trồng cây hàng năm khác',1),(6,'NTS','Đất nuôi trồng thủy sản',1),(7,'RSX','Đất rừng sản xuất',1),(8,'SKC','Đất phi nông nghiệp',1),(9,'TMD','Đất thương mại, dịch vụ',1),(10,'RPH','Đất rừng phòng hộ',0),(11,'ACSSXPNN','Đất cơ sở sản xuất phi nông nghiệp',1);
/*!40000 ALTER TABLE `land_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `noti_id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `noti_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`noti_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,4,'Tiếp nhận','Hồ sơ đã tiếp nhận','INFO',0,'2026-05-20 16:47:09'),(2,4,'Nộp thuế','Vui lòng thanh toán','PAYMENT',0,'2026-05-20 16:47:09'),(3,5,'Đã duyệt','Địa chính xác nhận','SUCCESS',1,'2026-05-20 16:47:09'),(4,6,'Thành công','Cảm ơn đã nộp thuế','SUCCESS',0,'2026-05-20 16:47:09'),(5,7,'Quá hạn','Hóa đơn quá hạn','WARNING',0,'2026-05-20 16:47:09'),(6,8,'Bổ sung','Chụp lại sổ đỏ','WARNING',0,'2026-05-20 16:47:09'),(7,9,'Chào mừng','Đăng nhập thành công','INFO',0,'2026-05-20 16:47:09'),(8,10,'Miễn giảm','Đã duyệt','SUCCESS',0,'2026-05-20 16:47:09'),(9,3,'Hồ sơ mới','Có hồ sơ chờ duyệt','WORKFLOW',0,'2026-05-20 16:47:09'),(10,2,'Đối soát','Lô đã hoàn tất','WORKFLOW',0,'2026-05-20 16:47:09'),(18,5,'To khai thue da duoc duyet','To khai ma #12 da duoc duyet. Vui long thanh toan so tien thue truoc han.','TAX_APPROVED',1,'2026-05-25 12:44:06'),(19,5,'To khai thue da duoc duyet','To khai ma #13 da duoc duyet. Vui long thanh toan so tien thue truoc han.','TAX_APPROVED',1,'2026-05-26 22:55:16'),(20,5,'Nop ho so thanh cong','Ho so #16 da duoc tiep nhan, dang cho xu ly.','DECLARATION_SUBMITTED',1,'2026-05-27 12:27:48'),(21,5,'Khiếu nại đã được cập nhật','Khiếu nại của bạn về hồ sơ #13 đã được cập nhật: null','COMPLAINT_UPDATED',1,'2026-05-28 15:06:16'),(22,5,'Nop ho so thanh cong','Ho so #17 da duoc tiep nhan, dang cho xu ly.','DECLARATION_SUBMITTED',0,'2026-05-28 22:56:51'),(23,5,'To khai thue da duoc duyet','To khai ma #17 da duoc duyet. Vui long thanh toan so tien thue truoc han.','TAX_APPROVED',0,'2026-05-28 23:08:13'),(24,5,'Nop ho so thanh cong','Ho so #18 da duoc tiep nhan, dang cho xu ly.','DECLARATION_SUBMITTED',0,'2026-05-31 17:35:05'),(25,5,'To khai thue bi tu choi','To khai ma #18 bi tu choi do: thiếu. Vui long kiem tra va nop lai.','TAX_REJECTED',0,'2026-06-01 20:51:31'),(26,5,'Nop ho so thanh cong','Ho so #19 da duoc tiep nhan, dang cho xu ly.','DECLARATION_SUBMITTED',0,'2026-06-02 11:21:20'),(27,5,'To khai thue da duoc duyet','To khai ma #19 da duoc duyet. Vui long thanh toan so tien thue truoc han.','TAX_APPROVED',0,'2026-06-02 12:00:23'),(83,5,'Thanh toan thue dat thanh cong','Cam on ban da nop thue dat nam 2026. Ma thanh toan #19, so tien: 5,000 VND. He thong da ghi nhan thanh cong.','PAYMENT_SUCCESS',0,'2026-06-03 10:59:57'),(84,5,'Thanh toan thue dat thanh cong','Cam on ban da nop thue dat nam 2026. Ma thanh toan #17, so tien: 5,000 VND. He thong da ghi nhan thanh cong.','PAYMENT_SUCCESS',0,'2026-06-03 11:01:26');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `processing_logs`
--

DROP TABLE IF EXISTS `processing_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `processing_logs` (
  `plog_id` int NOT NULL AUTO_INCREMENT,
  `record_id` int NOT NULL,
  `processor_account_id` int NOT NULL,
  `processing_step` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `processor_notes` text COLLATE utf8mb4_unicode_ci,
  `processed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'SYSTEM_ACTION',
  `actor_id` int DEFAULT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `old_data` longtext COLLATE utf8mb4_unicode_ci,
  `new_data` longtext COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`plog_id`),
  KEY `record_id` (`record_id`),
  KEY `processor_account_id` (`processor_account_id`),
  CONSTRAINT `processing_logs_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`),
  CONSTRAINT `processing_logs_ibfk_2` FOREIGN KEY (`processor_account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `processing_logs`
--

LOCK TABLES `processing_logs` WRITE;
/*!40000 ALTER TABLE `processing_logs` DISABLE KEYS */;
INSERT INTO `processing_logs` VALUES (1,1,3,'Xác nhận',NULL,'VERIFIED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(2,1,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(3,2,3,'Xác nhận',NULL,'VERIFIED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(4,2,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(5,3,3,'Xác nhận',NULL,'VERIFIED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(6,3,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(7,4,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(8,5,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(9,6,3,'Tiếp nhận',NULL,'PENDING',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(10,7,2,'Áp thuế',NULL,'APPROVED',NULL,'2026-05-20 16:47:09','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(11,12,16,'APPROVE','VERIFIED','APPROVED','Hồ sơ hợp lệ, đủ điều kiện phê duyệt','2026-05-25 12:44:06','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(12,13,2,'APPROVE','VERIFIED','APPROVED','Hồ sơ hợp lệ, đủ điều kiện phê duyệt','2026-05-26 22:55:16','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(13,17,2,'APPROVE','VERIFIED','APPROVED','Hồ sơ hợp lệ, đủ điều kiện phê duyệt','2026-05-28 23:08:13','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(14,18,2,'REJECT','SUBMITTED','REJECTED','thiếu','2026-06-01 20:51:31','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL),(15,19,2,'APPROVE','VERIFIED','APPROVED','Hồ sơ hợp lệ, đủ điều kiện phê duyệt','2026-06-02 12:00:23','SYSTEM_ACTION',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `processing_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reconciliation_batches`
--

DROP TABLE IF EXISTS `reconciliation_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reconciliation_batches` (
  `batch_id` int NOT NULL AUTO_INCREMENT,
  `officer_account_id` int NOT NULL,
  `total_records` int DEFAULT '0',
  `matched_count` int DEFAULT '0',
  `error_count` int DEFAULT '0',
  `batch_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`batch_id`),
  KEY `officer_account_id` (`officer_account_id`),
  CONSTRAINT `reconciliation_batches_ibfk_1` FOREIGN KEY (`officer_account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reconciliation_batches`
--

LOCK TABLES `reconciliation_batches` WRITE;
/*!40000 ALTER TABLE `reconciliation_batches` DISABLE KEYS */;
INSERT INTO `reconciliation_batches` VALUES (1,2,5,0,0,NULL,'2026-05-20 16:47:09'),(2,2,10,0,0,NULL,'2026-05-20 16:47:09'),(3,2,2,0,0,NULL,'2026-05-20 16:47:09'),(4,2,8,0,0,NULL,'2026-05-20 16:47:09'),(5,2,4,0,0,NULL,'2026-05-20 16:47:09'),(6,2,6,0,0,NULL,'2026-05-20 16:47:09'),(7,2,3,0,0,NULL,'2026-05-20 16:47:09'),(8,2,7,0,0,NULL,'2026-05-20 16:47:09'),(9,2,1,0,0,NULL,'2026-05-20 16:47:09'),(10,2,5,0,0,NULL,'2026-05-20 16:47:09');
/*!40000 ALTER TABLE `reconciliation_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reconciliation_logs`
--

DROP TABLE IF EXISTS `reconciliation_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reconciliation_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `transaction_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_received` decimal(18,2) NOT NULL,
  `bank_trans_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `webhook_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'UNMATCHED',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  UNIQUE KEY `bank_trans_id` (`bank_trans_id`),
  CONSTRAINT `reconciliation_logs_chk_1` CHECK (json_valid(`webhook_payload`))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reconciliation_logs`
--

LOCK TABLES `reconciliation_logs` WRITE;
/*!40000 ALTER TABLE `reconciliation_logs` DISABLE KEYS */;
INSERT INTO `reconciliation_logs` VALUES (11,'191671',5000.00,NULL,'{\"source\":\"MANUAL_SYNC\",\"payId\":19,\"orderCode\":\"191671\"}','MATCHED','2026-06-03 10:59:57'),(12,'170153',5000.00,NULL,'{\"source\":\"MANUAL_SYNC\",\"payId\":17,\"orderCode\":\"170153\"}','MATCHED','2026-06-03 11:01:26');
/*!40000 ALTER TABLE `reconciliation_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `record_documents`
--

DROP TABLE IF EXISTS `record_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `record_documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `record_id` int DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_id`),
  KEY `record_id` (`record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `record_documents`
--

LOCK TABLES `record_documents` WRITE;
/*!40000 ALTER TABLE `record_documents` DISABLE KEYS */;
INSERT INTO `record_documents` VALUES (1,1,'Sodo1.pdf','url1',NULL,'2026-05-20 16:47:09'),(2,2,'Sodo2.pdf','url2',NULL,'2026-05-20 16:47:09'),(3,3,'Sodo3.pdf','url3',NULL,'2026-05-20 16:47:09'),(4,4,'Sodo4.pdf','url4',NULL,'2026-05-20 16:47:09'),(5,5,'Sodo5.pdf','url5',NULL,'2026-05-20 16:47:09'),(6,6,'Sodo6.pdf','url6',NULL,'2026-05-20 16:47:09'),(7,7,'Sodo7.pdf','url7',NULL,'2026-05-20 16:47:09'),(8,8,'Sodo8.pdf','url8',NULL,'2026-05-20 16:47:09'),(9,9,'Sodo9.pdf','url9',NULL,'2026-05-20 16:47:09'),(10,10,'Sodo10.pdf','url10',NULL,'2026-05-20 16:47:09'),(12,16,'Screenshot 2026-05-26 231338.png','http://localhost:8080/api/files/20260527_122747_d0bb93db.png','image/png','2026-05-27 12:27:47'),(13,17,'Screenshot 2026-05-28 172618.png','http://localhost:8080/api/files/20260528_225650_9689db1f.png','image/png','2026-05-28 22:56:50'),(14,18,'Screenshot 2026-05-29 180354.png','http://localhost:8080/api/files/20260531_173501_0d297b60.png','image/png','2026-05-31 17:35:02'),(15,NULL,'Screenshot 2026-05-31 173514.png','http://localhost:8080/api/files/20260601_204204_1436325a.png','image/png','2026-06-01 20:42:04');
/*!40000 ALTER TABLE `record_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `records`
--

DROP TABLE IF EXISTS `records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `citizen_id` int NOT NULL,
  `land_parcel_id` int NOT NULL,
  `record_category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `citizen_id` (`citizen_id`),
  KEY `land_parcel_id` (`land_parcel_id`),
  CONSTRAINT `records_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  CONSTRAINT `records_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `records`
--

LOCK TABLES `records` WRITE;
/*!40000 ALTER TABLE `records` DISABLE KEYS */;
INSERT INTO `records` VALUES (1,4,1,'TAX','APPROVED','2026-05-20 16:47:09'),(2,5,2,'TAX','APPROVED','2026-05-20 16:47:09'),(3,6,3,'TAX','APPROVED','2026-05-20 16:47:09'),(4,7,4,'TAX','APPROVED','2026-05-20 16:47:09'),(5,8,5,'TAX','APPROVED','2026-05-20 16:47:09'),(6,9,6,'TAX','PENDING','2026-05-20 16:47:09'),(7,10,7,'TAX','APPROVED','2026-05-20 16:47:09'),(8,4,8,'TAX','APPROVED','2026-05-20 16:47:09'),(9,5,9,'TAX','APPROVED','2026-05-20 16:47:09'),(10,6,10,'TAX','APPROVED','2026-05-20 16:47:09'),(11,5,2,'Cấp đổi giấy chứng nhận','CANCELLED','2026-05-25 11:32:29'),(12,5,9,'Cấp đổi giấy chứng nhận','APPROVED','2026-05-25 11:50:44'),(13,5,2,'Đăng ký biến động đất đai','APPROVED','2026-05-26 22:43:50'),(14,5,2,'Đăng ký biến động đất đai','CANCELLED','2026-05-27 01:11:02'),(15,5,9,'Đăng ký biến động đất đai','CANCELLED','2026-05-27 01:34:56'),(16,5,2,'Tách/Hợp thửa đất','SUBMITTED','2026-05-27 12:27:48'),(17,5,2,'Cấp đổi giấy chứng nhận','COMPLETED','2026-05-28 22:56:51'),(18,5,2,'Cấp đổi giấy chứng nhận','REJECTED','2026-05-31 17:35:04'),(19,5,9,'Cấp đổi giấy chứng nhận','COMPLETED','2026-06-02 11:21:20');
/*!40000 ALTER TABLE `records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `token_id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `token_value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token_value` (`token_value`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,1,'tok-admin','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(2,2,'tok-tax','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(3,3,'tok-land','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(4,4,'tok-cit4','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(5,5,'tok-cit5','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(6,6,'tok-cit6','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(7,7,'tok-cit7','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(8,8,'tok-cit8','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(9,9,'tok-cit9','2026-12-31 00:00:00',0,'2026-05-20 16:47:09'),(10,10,'tok-cit10','2026-12-31 00:00:00',0,'2026-05-20 16:47:09');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_code` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ROLE_ADMIN','Quản trị viên'),(2,'ROLE_CITIZEN','Công dân'),(3,'ROLE_TAX_OFFICER','Cán bộ Thuế'),(4,'ROLE_LAND_OFFICER','Cán bộ Địa chính');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_declarations`
--

DROP TABLE IF EXISTS `tax_declarations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_declarations` (
  `declaration_id` int NOT NULL AUTO_INCREMENT,
  `record_id` int NOT NULL,
  `declared_area` decimal(10,2) NOT NULL,
  `declared_usage` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `declaration_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`declaration_id`),
  UNIQUE KEY `record_id` (`record_id`),
  CONSTRAINT `tax_declarations_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_declarations`
--

LOCK TABLES `tax_declarations` WRITE;
/*!40000 ALTER TABLE `tax_declarations` DISABLE KEYS */;
INSERT INTO `tax_declarations` VALUES (1,1,85.50,'Đất ở',NULL,'2026-05-20 16:47:09'),(2,2,120.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(3,3,200.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(4,4,350.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(5,5,1500.00,'Trồng lúa',NULL,'2026-05-20 16:47:09'),(6,6,60.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(7,7,90.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(8,8,150.00,'Đất ở',NULL,'2026-05-20 16:47:09'),(9,9,500.00,'TMDV',NULL,'2026-05-20 16:47:09'),(10,10,1000.00,'Trồng cây',NULL,'2026-05-20 16:47:09'),(11,11,120.00,NULL,NULL,'2026-05-25 11:32:29'),(12,12,500.00,NULL,NULL,'2026-05-25 11:50:44'),(13,13,120.00,NULL,NULL,'2026-05-26 22:43:50'),(14,14,120.00,NULL,NULL,'2026-05-27 01:11:02'),(15,15,500.00,NULL,NULL,'2026-05-27 01:34:56'),(16,16,120.00,NULL,NULL,'2026-05-27 12:27:48'),(17,17,120.00,NULL,NULL,'2026-05-28 22:56:51'),(18,18,120.00,'test','thiếu','2026-05-31 17:35:05'),(19,19,500.00,'Riêng',NULL,'2026-06-02 11:21:20');
/*!40000 ALTER TABLE `tax_declarations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_exempt_subjects`
--

DROP TABLE IF EXISTS `tax_exempt_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_exempt_subjects` (
  `exempt_id` int NOT NULL AUTO_INCREMENT,
  `citizen_id` int NOT NULL,
  `uploaded_by_account` int NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `exemption_reason` text COLLATE utf8mb4_unicode_ci,
  `discount_rate` decimal(5,2) NOT NULL,
  `applied_year` int NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  PRIMARY KEY (`exempt_id`),
  KEY `citizen_id` (`citizen_id`),
  KEY `uploaded_by_account` (`uploaded_by_account`),
  CONSTRAINT `tax_exempt_subjects_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  CONSTRAINT `tax_exempt_subjects_ibfk_2` FOREIGN KEY (`uploaded_by_account`) REFERENCES `accounts` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_exempt_subjects`
--

LOCK TABLES `tax_exempt_subjects` WRITE;
/*!40000 ALTER TABLE `tax_exempt_subjects` DISABLE KEYS */;
INSERT INTO `tax_exempt_subjects` VALUES (1,4,1,'Nguyễn Văn Bình',NULL,50.00,2026,'2026-05-20 16:47:09','PENDING'),(2,5,1,'Lý Nhã Kỳ','Hộ cận nghèo',50.00,2026,'2026-05-20 16:47:09','PENDING'),(3,6,1,'Phạm Xuân Ẩn',NULL,50.00,2026,'2026-05-20 16:47:09','PENDING'),(4,7,1,'Vũ Trọng Phụng',NULL,100.00,2026,'2026-05-20 16:47:09','PENDING'),(5,8,1,'Hồ Xuân Hương',NULL,100.00,2026,'2026-05-20 16:47:09','PENDING'),(6,9,1,'Đinh Bộ Lĩnh',NULL,50.00,2026,'2026-05-20 16:47:09','PENDING'),(7,10,1,'Trần Hưng Đạo',NULL,50.00,2026,'2026-05-20 16:47:09','PENDING'),(8,4,1,'Nguyễn Văn Bình (Cũ)',NULL,50.00,2025,'2026-05-20 16:47:09','PENDING'),(9,5,1,'Lý Nhã Kỳ (Cũ)',NULL,100.00,2025,'2026-05-20 16:47:09','PENDING'),(10,6,1,'Phạm Xuân Ẩn (Cũ)',NULL,50.00,2025,'2026-05-20 16:47:09','PENDING');
/*!40000 ALTER TABLE `tax_exempt_subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_payment_details`
--

DROP TABLE IF EXISTS `tax_payment_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_payment_details` (
  `detail_id` int NOT NULL AUTO_INCREMENT,
  `pay_id` int NOT NULL,
  `rate_id` int NOT NULL,
  `calculated_area` decimal(10,2) NOT NULL,
  `applied_tax_rate` decimal(5,4) NOT NULL,
  `applied_unit_price` decimal(18,2) NOT NULL,
  `line_amount` decimal(18,2) NOT NULL,
  PRIMARY KEY (`detail_id`),
  KEY `pay_id` (`pay_id`),
  KEY `rate_id` (`rate_id`),
  CONSTRAINT `tax_payment_details_ibfk_1` FOREIGN KEY (`pay_id`) REFERENCES `tax_payments` (`pay_id`),
  CONSTRAINT `tax_payment_details_ibfk_2` FOREIGN KEY (`rate_id`) REFERENCES `tax_rates` (`rate_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_payment_details`
--

LOCK TABLES `tax_payment_details` WRITE;
/*!40000 ALTER TABLE `tax_payment_details` DISABLE KEYS */;
INSERT INTO `tax_payment_details` VALUES (1,1,1,85.50,0.0003,100000000.00,540000.00),(2,2,1,120.00,0.0003,80000000.00,120000.00),(3,3,1,200.00,0.0003,50000000.00,750000.00),(4,4,1,350.00,0.0003,20000000.00,300000.00),(5,5,4,1500.00,0.0001,500000.00,450000.00),(6,6,1,60.00,0.0003,95000000.00,90000.00),(7,7,1,90.00,0.0003,75000000.00,820000.00),(8,8,1,150.00,0.0003,48000000.00,150000.00),(9,9,7,500.00,0.0006,120000000.00,600000.00),(10,10,4,1000.00,0.0001,1500000.00,330000.00);
/*!40000 ALTER TABLE `tax_payment_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_payments`
--

DROP TABLE IF EXISTS `tax_payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_payments` (
  `pay_id` int NOT NULL AUTO_INCREMENT,
  `record_id` int DEFAULT NULL,
  `land_parcel_id` int NOT NULL,
  `tax_year` int NOT NULL,
  `total_amount_due` decimal(18,2) NOT NULL,
  `due_date` date NOT NULL,
  `payment_status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'UNPAID',
  `transaction_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  PRIMARY KEY (`pay_id`),
  UNIQUE KEY `transaction_code` (`transaction_code`),
  KEY `record_id` (`record_id`),
  KEY `land_parcel_id` (`land_parcel_id`),
  CONSTRAINT `tax_payments_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`),
  CONSTRAINT `tax_payments_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_payments`
--

LOCK TABLES `tax_payments` WRITE;
/*!40000 ALTER TABLE `tax_payments` DISABLE KEYS */;
INSERT INTO `tax_payments` VALUES (1,1,1,2026,540000.00,'2026-12-31','PAID','THUE_001',NULL),(2,2,2,2026,120000.00,'2026-12-31','PAID','THUE_002',NULL),(3,3,3,2026,750000.00,'2026-12-31','PAID','THUE_003',NULL),(4,4,4,2026,300000.00,'2026-12-31','PAID','THUE_004',NULL),(5,5,5,2026,450000.00,'2026-12-31','PAID','THUE_005',NULL),(6,NULL,6,2026,90000.00,'2026-12-31','UNPAID','THUE_ERR',NULL),(7,7,7,2026,820000.00,'2026-12-31','PAID','THUE_007',NULL),(8,8,8,2026,150000.00,'2026-12-31','PAID','THUE_008',NULL),(9,9,9,2026,600000.00,'2026-12-31','PAID','THUE_009',NULL),(10,10,10,2026,330000.00,'2026-12-31','PAID','THUE_010',NULL),(11,11,2,2026,0.00,'2026-12-31','UNPAID','TX-B66E93C1D554',NULL),(12,12,9,2026,0.00,'2026-12-31','AWAITING_PAYMENT','TX-D07DA93D9F2F',NULL),(13,13,2,2026,0.00,'2026-12-31','AWAITING_PAYMENT','TX-68BDABE1483A',NULL),(14,14,2,2026,0.00,'2026-12-31','UNPAID','TX-0B29312A4305',NULL),(15,15,9,2026,0.00,'2026-12-31','UNPAID','TX-EFDD570A1B1A',NULL),(16,16,2,2026,0.00,'2026-12-31','UNPAID','TX-F905CF5E4F18',NULL),(17,17,2,2026,5000.00,'2026-12-31','PAID','170153','2026-06-03 11:01:25'),(18,18,2,2026,0.00,'2026-12-31','CANCELLED','TX-339F14CF2702',NULL),(19,19,9,2026,5000.00,'2026-12-31','PAID','191671','2026-06-03 10:59:57');
/*!40000 ALTER TABLE `tax_payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_rates`
--

DROP TABLE IF EXISTS `tax_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tax_rates` (
  `rate_id` int NOT NULL AUTO_INCREMENT,
  `tax_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_value` decimal(5,4) NOT NULL,
  `rate_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`rate_id`),
  UNIQUE KEY `rate_code` (`rate_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_rates`
--

LOCK TABLES `tax_rates` WRITE;
/*!40000 ALTER TABLE `tax_rates` DISABLE KEYS */;
INSERT INTO `tax_rates` VALUES (1,'Trong hạn mức',0.0003,'TIER_1'),(2,'Vượt <= 3 lần HM',0.0007,'TIER_2'),(3,'Vượt > 3 lần HM',0.0015,'TIER_3'),(4,'Nông nghiệp bậc 1',0.0001,'AGRI_1'),(5,'Nông nghiệp bậc 2',0.0002,'AGRI_2'),(6,'Phi nông nghiệp',0.0005,'PROD_1'),(7,'Thương mại',0.0006,'COM_1'),(8,'Rừng sản xuất',0.0001,'FOR_1'),(9,'Thủy sản',0.0002,'AQUA_1'),(10,'Phạt nộp chậm',0.0005,'LATE_FEE');
/*!40000 ALTER TABLE `tax_rates` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-03 11:51:25
