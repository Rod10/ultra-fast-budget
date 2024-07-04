-- MySQL dump 10.13  Distrib 8.0.23, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ultrafastbudget
-- ------------------------------------------------------
-- Server version	5.5.5-10.5.23-MariaDB-0+deb11u1

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
-- Table structure for table `ACCOUNT`
--

DROP TABLE IF EXISTS `ACCOUNT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ACCOUNT` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `ACCOUNT_TYPE_ID` int(20) NOT NULL,
  `NAME` varchar(45) NOT NULL,
  `CURRENCY` enum('EUR','USD','JPY','CNY') NOT NULL DEFAULT 'EUR',
  `INITIAL_BALANCE` float NOT NULL,
  `BALANCE` float NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `ACCOUNT_TYPE_ID` (`ACCOUNT_TYPE_ID`),
  CONSTRAINT `ACCOUNT_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `ACCOUNT_ibfk_2` FOREIGN KEY (`ACCOUNT_TYPE_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACCOUNT`
--

LOCK TABLES `ACCOUNT` WRITE;
/*!40000 ALTER TABLE `ACCOUNT` DISABLE KEYS */;
INSERT INTO `ACCOUNT` VALUES (1,1,1,'Portefeuille','EUR',70,70,'2024-07-01 14:04:34','2024-07-01 14:04:34'),(2,1,2,'Courant','EUR',1685.46,3452.72,'2024-07-01 14:05:02','2024-07-03 08:00:00'),(3,1,3,'Livret A','EUR',23068.3,23068.3,'2024-07-01 14:05:16','2024-07-01 14:05:16'),(5,1,5,'LEP','EUR',4530,4530,'2024-07-01 14:06:31','2024-07-01 14:06:31'),(8,1,8,'PEL','EUR',3268.27,3268.27,'2024-07-01 14:07:39','2024-07-01 14:07:39'),(11,1,11,'Liquiditées','EUR',20.01,20.01,'2024-07-01 14:08:40','2024-07-01 14:08:40'),(12,1,11,'Portefeuille (Actions)','EUR',28.45,28.45,'2024-07-01 14:09:35','2024-07-01 15:04:33');
/*!40000 ALTER TABLE `ACCOUNT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ACCOUNT_TYPE`
--

DROP TABLE IF EXISTS `ACCOUNT_TYPE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ACCOUNT_TYPE` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `NAME` varchar(45) NOT NULL,
  `TYPE` varchar(45) NOT NULL,
  `COLOR` varchar(45) NOT NULL,
  `CLASS_NAME` varchar(45) NOT NULL,
  `INTEREST` float NOT NULL,
  `UNIT` enum('YEAR','MONTH','WEEK','DAY') DEFAULT 'MONTH',
  `MAX_AMOUNT` float NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  CONSTRAINT `ACCOUNT_TYPE_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACCOUNT_TYPE`
--

LOCK TABLES `ACCOUNT_TYPE` WRITE;
/*!40000 ALTER TABLE `ACCOUNT_TYPE` DISABLE KEYS */;
INSERT INTO `ACCOUNT_TYPE` VALUES (1,1,'Portefeuille','WALLET','#cc0f35','is-danger is-light',0,NULL,0,'2024-07-01 12:29:31','2024-07-01 12:29:31'),(2,1,'Compte courant','COURANT','#638d5c','is-white',0,NULL,0,'2024-07-01 12:29:31','2024-07-01 12:29:31'),(3,1,'Livret A','LIVRETA','#000000','is-black',3,'YEAR',22950,'2024-07-01 12:29:31','2024-07-01 12:29:31'),(4,1,'Livret de développement durable et solidaire','LDDS','#888888','is-light',3,'YEAR',12000,'2024-07-01 12:29:31','2024-07-01 12:29:31'),(5,1,'Livret dépargne populaire','LEP','#FFE08AFF','is-warning',5,'YEAR',10000,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(6,1,'Livret jeune','LIVRETJ','#00D1B2FF','is-primary',3,'YEAR',1600,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(7,1,'Compte épargne logement','CEL','#485FC7FF','is-link',2,'YEAR',15300,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(8,1,'Plan épargne logement','PEL','#a974ff','.is-link.is-light',2,'YEAR',61200,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(9,1,'Plan épargne retraite populaire','PERP','#3E8ED0FF','is-info',2,'YEAR',0,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(10,1,'Compte sur livret','CSL','#48C78EFF','is-success',0,'YEAR',0,'2024-07-01 12:29:32','2024-07-01 12:29:32'),(11,1,'Trading 212','TRADING212L','lightblue','is-info is-light',4.2,'DAY',0,'2024-07-01 13:41:48','2024-07-01 13:41:48');
/*!40000 ALTER TABLE `ACCOUNT_TYPE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BUDGET`
--

DROP TABLE IF EXISTS `BUDGET`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `BUDGET` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `NAME` varchar(45) NOT NULL,
  `TOTAL_AMOUNT` float NOT NULL,
  `TOTAL_ALLOCATED_AMOUNT` float NOT NULL,
  `DURATION` int(20) NOT NULL,
  `UNIT` enum('YEAR','MONTH','WEEK','DAY') NOT NULL DEFAULT 'MONTH',
  `CATEGORY_ID` int(20) NOT NULL,
  `DATA` text DEFAULT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `CATEGORY_ID` (`CATEGORY_ID`),
  CONSTRAINT `BUDGET_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `BUDGET_ibfk_2` FOREIGN KEY (`CATEGORY_ID`) REFERENCES `CATEGORY` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BUDGET`
--

LOCK TABLES `BUDGET` WRITE;
/*!40000 ALTER TABLE `BUDGET` DISABLE KEYS */;
/*!40000 ALTER TABLE `BUDGET` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CATEGORY`
--

DROP TABLE IF EXISTS `CATEGORY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CATEGORY` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `GENRE` enum('INCOME','OUTCOME') NOT NULL DEFAULT 'INCOME',
  `NAME` varchar(45) NOT NULL,
  `TYPE` varchar(45) NOT NULL,
  `IMAGE_PATH` text NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  CONSTRAINT `CATEGORY_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CATEGORY`
--

LOCK TABLES `CATEGORY` WRITE;
/*!40000 ALTER TABLE `CATEGORY` DISABLE KEYS */;
INSERT INTO `CATEGORY` VALUES (1,1,'OUTCOME','Alimentations','FOOD','1-Billy/categories/food.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(2,1,'OUTCOME','Courses','SHOPPING','1-Billy/categories/shopping.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(3,1,'OUTCOME','Transport','TRANSPORT','1-Billy/categories/transport.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(4,1,'OUTCOME','Divertissement','ENTERTAINMENT','1-Billy/categories/entertainment.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(5,1,'OUTCOME','Maison','HOME','1-Billy/categories/home.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(6,1,'OUTCOME','Famille','FAMILY','1-Billy/categories/family.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(7,1,'OUTCOME','Santé/Sport','HEALTH','1-Billy/categories/health.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(8,1,'OUTCOME','Voyage','TRAVEL','1-Billy/categories/travel.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(9,1,'OUTCOME','Animaux de compagnie','PET','1-Billy/categories/pet.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(10,1,'OUTCOME','Autre (Dépenses)','OTHER','1-Billy/categories/other.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(11,1,'INCOME','Autre (Revenus)','OTHER_INCOME','1-Billy/categories/other_income.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(12,1,'INCOME','Revenus financier','FINANCIAL','1-Billy/categories/financial.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(13,1,'INCOME','Revenus','INCOME','1-Billy/categories/income.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(14,1,'OUTCOME','Patreon','patreon','1-Billy/categories/patreon.png','2024-07-01 13:00:26','2024-07-01 13:00:26'),(15,1,'OUTCOME','Trading 212','tranding-212','1-Billy/categories/tranding-212.png','2024-07-01 13:38:01','2024-07-01 13:38:01');
/*!40000 ALTER TABLE `CATEGORY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PLANNED_TRANSACTION`
--

DROP TABLE IF EXISTS `PLANNED_TRANSACTION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PLANNED_TRANSACTION` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `ACCOUNT_ID` int(20) NOT NULL,
  `DATA` text DEFAULT NULL,
  `TO` text DEFAULT NULL,
  `OTHER` text DEFAULT NULL,
  `TRANSACTION_DATE` datetime NOT NULL,
  `TYPE` enum('INCOME','EXPECTED_INCOME','EXPENSE','EXPECTED_EXPENSE','TRANSFER','EXPECTED_TRANSFERT','INTEREST') NOT NULL DEFAULT 'EXPENSE',
  `OCCURENCE` int(20) NOT NULL,
  `UNIT` enum('YEAR','MONTH','WEEK','DAY') NOT NULL DEFAULT 'MONTH',
  `NUMBER` int(20) NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  `DELETED_ON` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `ACCOUNT_ID` (`ACCOUNT_ID`),
  CONSTRAINT `PLANNED_TRANSACTION_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `PLANNED_TRANSACTION_ibfk_2` FOREIGN KEY (`ACCOUNT_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PLANNED_TRANSACTION`
--

LOCK TABLES `PLANNED_TRANSACTION` WRITE;
/*!40000 ALTER TABLE `PLANNED_TRANSACTION` DISABLE KEYS */;
INSERT INTO `PLANNED_TRANSACTION` VALUES (1,1,2,'[{\"category\":{\"id\":13,\"genre\":\"INCOME\",\"userId\":1,\"name\":\"Revenus\",\"type\":\"INCOME\",\"imagePath\":\"1-Billy/categories/income.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":34,\"userId\":1,\"categoryId\":13,\"name\":\"Salaire\",\"type\":\"SALARY\",\"imagePath\":\"1-Billy/subcategories/salary.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"1842.68\"}]','','','2024-08-01 08:00:00','EXPECTED_INCOME',1,'MONTH',0,'2024-07-01 16:58:15','2024-07-01 16:58:15',NULL),(2,1,2,'[{\"category\":{\"id\":10,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Autre (Dépenses)\",\"type\":\"OTHER\",\"imagePath\":\"1-Billy/categories/other.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":46,\"userId\":1,\"categoryId\":10,\"name\":\"Banque\",\"type\":\"banque\",\"imagePath\":\"1-Billy/subcategories/banque.png\",\"creationDate\":\"2024-07-01T13:32:11.000Z\",\"modificationDate\":\"2024-07-01T13:32:11.000Z\"},\"amount\":\"4.28\"}]','','','2024-08-03 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:03:16','2024-07-03 08:00:00',NULL),(3,1,2,'[{\"category\":{\"id\":3,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/categories/transport.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":10,\"userId\":1,\"categoryId\":3,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/subcategories/transport.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"86.40\"}]','','Navigo','2024-08-03 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:03:50','2024-07-03 08:00:00',NULL),(4,1,2,'[{\"category\":{\"id\":14,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Patreon\",\"type\":\"patreon\",\"imagePath\":\"1-Billy/categories/patreon.png\",\"creationDate\":\"2024-07-01T13:00:26.000Z\",\"modificationDate\":\"2024-07-01T13:00:26.000Z\"},\"subCategory\":{\"id\":38,\"userId\":1,\"categoryId\":14,\"name\":\"Recifense Cheers\",\"type\":\"recifense\",\"imagePath\":\"1-Billy/subcategories/recifense.png\",\"creationDate\":\"2024-07-01T13:07:07.000Z\",\"modificationDate\":\"2024-07-01T13:07:07.000Z\"},\"amount\":\"1.20\"}]','','','2024-08-03 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:04:38','2024-07-03 08:00:00',NULL),(5,1,2,'[{\"category\":{\"id\":5,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Maison\",\"type\":\"HOME\",\"imagePath\":\"1-Billy/categories/home.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":18,\"userId\":1,\"categoryId\":5,\"name\":\"Loyer\",\"type\":\"RENT\",\"imagePath\":\"1-Billy/subcategories/rent.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"300\"}]','','Famille','2024-07-05 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:05:46','2024-07-01 17:05:46',NULL),(6,1,2,'[{\"category\":{\"id\":10,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Autre (Dépenses)\",\"type\":\"OTHER\",\"imagePath\":\"1-Billy/categories/other.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":47,\"userId\":1,\"categoryId\":10,\"name\":\"Coalition plus\",\"type\":\"coalition\",\"imagePath\":\"1-Billy/subcategories/coalition.png\",\"creationDate\":\"2024-07-01T13:32:46.000Z\",\"modificationDate\":\"2024-07-01T13:32:46.000Z\"},\"amount\":\"10\"}]','','','2024-07-05 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:06:19','2024-07-01 17:06:19',NULL),(7,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":48,\"userId\":1,\"categoryId\":4,\"name\":\"Sankaku\",\"type\":\"sankaku\",\"imagePath\":\"1-Billy/subcategories/sankaku.png\",\"creationDate\":\"2024-07-01T13:33:03.000Z\",\"modificationDate\":\"2024-07-01T13:33:03.000Z\"},\"amount\":\"9.99\"}]','','','2024-07-05 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:06:45','2024-07-01 17:06:45',NULL),(8,1,2,'[{\"category\":{\"id\":10,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Autre (Dépenses)\",\"type\":\"OTHER\",\"imagePath\":\"1-Billy/categories/other.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":49,\"userId\":1,\"categoryId\":10,\"name\":\"Carte débit\",\"type\":\"carte-debit\",\"imagePath\":\"1-Billy/subcategories/carte-debit.png\",\"creationDate\":\"2024-07-01T13:37:26.000Z\",\"modificationDate\":\"2024-07-01T13:37:26.000Z\"},\"amount\":\"2\"}]','','','2024-07-21 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:08:41','2024-07-01 17:08:41',NULL),(9,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":52,\"userId\":1,\"categoryId\":4,\"name\":\"Luvr.ai\",\"type\":\"luvr-ai\",\"imagePath\":\"1-Billy/subcategories/luvr-ai.png\",\"creationDate\":\"2024-07-01T13:39:48.000Z\",\"modificationDate\":\"2024-07-01T13:39:48.000Z\"},\"amount\":\"6.55\"}]','','','2024-07-24 17:08:45','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:09:12','2024-07-01 17:09:12',NULL),(10,1,2,'[{\"category\":{\"id\":5,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Maison\",\"type\":\"HOME\",\"imagePath\":\"1-Billy/categories/home.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":21,\"userId\":1,\"categoryId\":5,\"name\":\"Facture téléphonique\",\"type\":\"PHONEBILL\",\"imagePath\":\"1-Billy/subcategories/phonebill.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"31.99\"}]','','Tel portable','2024-07-28 10:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:09:48','2024-07-01 17:09:48',NULL),(11,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":53,\"userId\":1,\"categoryId\":4,\"name\":\"Spotify\",\"type\":\"spotify\",\"imagePath\":\"1-Billy/subcategories/spotify.webp\",\"creationDate\":\"2024-07-01T17:13:00.000Z\",\"modificationDate\":\"2024-07-01T17:13:43.000Z\"},\"amount\":\"10.99\"}]','','','2024-08-02 13:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:14:27','2024-07-02 13:00:00',NULL),(12,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":40,\"userId\":1,\"categoryId\":4,\"name\":\"Steam\",\"type\":\"steam\",\"imagePath\":\"1-Billy/subcategories/steam.png\",\"creationDate\":\"2024-07-01T13:27:40.000Z\",\"modificationDate\":\"2024-07-01T17:12:32.000Z\"},\"amount\":\"7.99\"}]','','','2024-07-06 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:15:36','2024-07-01 17:15:36',NULL),(13,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":44,\"userId\":1,\"categoryId\":4,\"name\":\"Discord\",\"type\":\"discord\",\"imagePath\":\"1-Billy/subcategories/discord.png\",\"creationDate\":\"2024-07-01T13:29:19.000Z\",\"modificationDate\":\"2024-07-01T13:29:19.000Z\"},\"amount\":\"4.99\"}]','','Rod24','2024-07-14 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:16:26','2024-07-01 17:16:26',NULL),(14,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":44,\"userId\":1,\"categoryId\":4,\"name\":\"Discord\",\"type\":\"discord\",\"imagePath\":\"1-Billy/subcategories/discord.png\",\"creationDate\":\"2024-07-01T13:29:19.000Z\",\"modificationDate\":\"2024-07-01T13:29:19.000Z\"},\"amount\":\"9.99\"}]','','Rod48','2024-07-24 08:00:00','EXPECTED_EXPENSE',1,'MONTH',0,'2024-07-01 17:17:27','2024-07-01 17:17:27',NULL);
/*!40000 ALTER TABLE `PLANNED_TRANSACTION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PLANNED_TRANSFER`
--

DROP TABLE IF EXISTS `PLANNED_TRANSFER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PLANNED_TRANSFER` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `SENDER_ID` int(20) NOT NULL,
  `RECEIVER_ID` int(20) NOT NULL,
  `AMOUNT` text DEFAULT NULL,
  `OTHER` text DEFAULT NULL,
  `TRANSFER_DATE` datetime NOT NULL,
  `OCCURENCE` int(20) NOT NULL,
  `UNIT` enum('YEAR','MONTH','WEEK','DAY') NOT NULL DEFAULT 'MONTH',
  `NUMBER` int(20) NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  `DELETED_ON` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `SENDER_ID` (`SENDER_ID`),
  KEY `RECEIVER_ID` (`RECEIVER_ID`),
  CONSTRAINT `PLANNED_TRANSFER_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `PLANNED_TRANSFER_ibfk_2` FOREIGN KEY (`SENDER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `PLANNED_TRANSFER_ibfk_3` FOREIGN KEY (`RECEIVER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PLANNED_TRANSFER`
--

LOCK TABLES `PLANNED_TRANSFER` WRITE;
/*!40000 ALTER TABLE `PLANNED_TRANSFER` DISABLE KEYS */;
INSERT INTO `PLANNED_TRANSFER` VALUES (1,1,2,5,'750','0','2024-07-05 08:00:00',1,'MONTH',0,'2024-07-01 17:30:10','2024-07-01 17:30:10',NULL),(2,1,2,8,'100','0','2024-07-05 08:00:00',1,'MONTH',0,'2024-07-01 17:30:38','2024-07-01 17:30:38',NULL);
/*!40000 ALTER TABLE `PLANNED_TRANSFER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SUBCATEGORY`
--

DROP TABLE IF EXISTS `SUBCATEGORY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SUBCATEGORY` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `CATEGORY_ID` int(20) NOT NULL,
  `NAME` varchar(45) NOT NULL,
  `TYPE` varchar(45) NOT NULL,
  `IMAGE_PATH` text NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `CATEGORY_ID` (`CATEGORY_ID`),
  CONSTRAINT `SUBCATEGORY_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `SUBCATEGORY_ibfk_2` FOREIGN KEY (`CATEGORY_ID`) REFERENCES `CATEGORY` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUBCATEGORY`
--

LOCK TABLES `SUBCATEGORY` WRITE;
/*!40000 ALTER TABLE `SUBCATEGORY` DISABLE KEYS */;
INSERT INTO `SUBCATEGORY` VALUES (1,1,1,'Alimentation','FOOD','1-Billy/subcategories/food.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(2,1,9,'Alimentation','FOOD','1-Billy/subcategories/food.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(3,1,1,'Restaurant','RESTAURANT','1-Billy/subcategories/restaurant.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(4,1,1,'Bar','BAR','1-Billy/subcategories/bar.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(5,1,2,'Courses','SHOPPING','1-Billy/subcategories/shopping.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(6,1,2,'Chaussure','SHOES','1-Billy/subcategories/shoes.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(7,1,2,'Technologie','TECHNOLOGY','1-Billy/subcategories/techo.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(8,1,2,'Cadeaux','GIFT','1-Billy/subcategories/gift.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(9,1,2,'Vêtements','CLOTHES','1-Billy/subcategories/clothes.png ','2024-07-01 12:29:31','2024-07-01 12:29:31'),(10,1,3,'Transport','TRANSPORT','1-Billy/subcategories/transport.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(11,1,8,'Transport','TRANSPORT','1-Billy/subcategories/transport.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(12,1,3,'Voiture','CAR','1-Billy/subcategories/car.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(13,1,3,'Carburant','FUEL','1-Billy/subcategories/fuel.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(14,1,3,'Assurance','INSURANCE','1-Billy/subcategories/insurance.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(15,1,4,'Divertissement','ENTERTAINMENT','1-Billy/subcategories/entertainment.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(16,1,4,'Livres/Revues','BOOKS','1-Billy/subcategories/books.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(17,1,5,'Maison','HOUSE','1-Billy/subcategories/home.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(18,1,5,'Loyer','RENT','1-Billy/subcategories/rent.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(19,1,5,'Facture d\'énergie','ENERGYBILL','1-Billy/subcategories/energybill.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(20,1,5,'Facture d\'eau','WATERBILL','1-Billy/subcategories/waterbill.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(21,1,5,'Facture téléphonique','PHONEBILL','1-Billy/subcategories/phonebill.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(22,1,6,'Famille','FAMILY','1-Billy/subcategories/family.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(23,1,6,'Enfants','KIDS','1-Billy/subcategories/kids.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(24,1,6,'Education','EDUCATION','1-Billy/subcategories/education.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(25,1,7,'Santé','HEALTH','1-Billy/subcategories/health.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(26,1,9,'Santé','HEALTH','1-Billy/subcategories/health.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(27,1,7,'Sport','SPORT','1-Billy/subcategories/sport.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(28,1,8,'Voyage','TRAVEL','1-Billy/subcategories/travel.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(29,1,8,'Logement','HOUSING','1-Billy/subcategories/home.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(30,1,11,'Autre (Revenues)','OTHERS','1-Billy/subcategories/other_income.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(31,1,10,'Impôts','TAX','1-Billy/subcategories/tax.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(32,1,10,'Cigarettes','CIGARETTE','1-Billy/subcategories/cigarettes.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(33,1,12,'Revenues financiers','INCOME','1-Billy/subcategories/financial.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(34,1,13,'Salaire','SALARY','1-Billy/subcategories/salary.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(35,1,13,'Petits boulots','SMALLJOB','1-Billy/subcategories/smalljob.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(36,1,13,'Pension','PENSION','1-Billy/subcategories/pension.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(37,1,11,'Epargne','SAVING','1-Billy/subcategories/saving.png','2024-07-01 12:29:31','2024-07-01 12:29:31'),(38,1,14,'Recifense Cheers','recifense','1-Billy/subcategories/recifense.png','2024-07-01 13:07:07','2024-07-01 13:07:07'),(39,1,4,'Nikke','nikke','1-Billy/subcategories/nikke.jpg','2024-07-01 13:24:37','2024-07-01 13:24:37'),(40,1,4,'Steam','steam','1-Billy/subcategories/steam.png','2024-07-01 13:27:40','2024-07-01 17:12:32'),(42,1,4,'War Thunder','war-thunder','1-Billy/subcategories/war-thunder.png','2024-07-01 13:28:21','2024-07-01 13:28:21'),(43,1,4,'Enlisted','enlisted','1-Billy/subcategories/enlisted.png','2024-07-01 13:28:34','2024-07-01 13:28:34'),(44,1,4,'Discord','discord','1-Billy/subcategories/discord.png','2024-07-01 13:29:19','2024-07-01 13:29:19'),(45,1,1,'Uber Eats','uber-eats','1-Billy/subcategories/uber-eats.png','2024-07-01 13:30:59','2024-07-01 13:30:59'),(46,1,10,'Banque','banque','1-Billy/subcategories/banque.png','2024-07-01 13:32:11','2024-07-01 13:32:11'),(47,1,10,'Coalition plus','coalition','1-Billy/subcategories/coalition.png','2024-07-01 13:32:46','2024-07-01 13:32:46'),(48,1,4,'Sankaku','sankaku','1-Billy/subcategories/sankaku.png','2024-07-01 13:33:03','2024-07-01 13:33:03'),(49,1,10,'Carte débit','carte-debit','1-Billy/subcategories/carte-debit.png','2024-07-01 13:37:26','2024-07-01 13:37:26'),(50,1,15,'Liquiditées','liquiditees','1-Billy/subcategories/liquiditees.png','2024-07-01 13:38:27','2024-07-01 13:38:27'),(51,1,15,'Portefeuille','portefeuille','1-Billy/subcategories/portefeuille.png','2024-07-01 13:39:11','2024-07-01 13:39:11'),(52,1,4,'Luvr.ai','luvr-ai','1-Billy/subcategories/luvr-ai.png','2024-07-01 13:39:48','2024-07-01 13:39:48'),(53,1,4,'Spotify','spotify','1-Billy/subcategories/spotify.webp','2024-07-01 17:13:00','2024-07-01 17:13:43');
/*!40000 ALTER TABLE `SUBCATEGORY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20240506000000-create-user.js'),('20240506000001-create-category.js'),('20240506000002-create-subcategory.js'),('20240506000003-create-accounttype.js'),('20240506000004-create-account.js'),('20240506000005-create-transaction.js'),('20240506000006-create-budget.js'),('20240506000007-create-plannified-transaction.js'),('20240506000008-create-transfer.js'),('20240506000009-create-planned-transfer.js');
/*!40000 ALTER TABLE `SequelizeMeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TRANSACTION`
--

DROP TABLE IF EXISTS `TRANSACTION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TRANSACTION` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `ACCOUNT_ID` int(20) NOT NULL,
  `DATA` text DEFAULT NULL,
  `TO` text DEFAULT NULL,
  `OTHER` text DEFAULT NULL,
  `TRANSACTION_DATE` datetime NOT NULL,
  `TYPE` enum('INCOME','EXPECTED_INCOME','EXPENSE','EXPECTED_EXPENSE','TRANSFER','EXPECTED_TRANSFERT','INTEREST') NOT NULL DEFAULT 'EXPENSE',
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  `DELETED_ON` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `ACCOUNT_ID` (`ACCOUNT_ID`),
  CONSTRAINT `TRANSACTION_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSACTION_ibfk_2` FOREIGN KEY (`ACCOUNT_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSACTION`
--

LOCK TABLES `TRANSACTION` WRITE;
/*!40000 ALTER TABLE `TRANSACTION` DISABLE KEYS */;
INSERT INTO `TRANSACTION` VALUES (1,1,2,'[{\"category\":{\"id\":13,\"genre\":\"INCOME\",\"userId\":1,\"name\":\"Revenus\",\"type\":\"INCOME\",\"imagePath\":\"1-Billy/categories/income.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":34,\"userId\":1,\"categoryId\":13,\"name\":\"Salaire\",\"type\":\"SALARY\",\"imagePath\":\"1-Billy/subcategories/salary.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"1842.68\"}]','','','2024-07-01 08:00:00','INCOME','2024-07-01 17:00:18','2024-07-01 17:00:18',NULL),(2,1,2,'[{\"category\":{\"id\":1,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Alimentations\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/categories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":1,\"userId\":1,\"categoryId\":1,\"name\":\"Alimentation\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/subcategories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"9.40\"}]','','','2024-07-01 10:45:00','EXPENSE','2024-07-01 17:01:56','2024-07-01 17:01:56',NULL),(3,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":39,\"userId\":1,\"categoryId\":4,\"name\":\"Nikke\",\"type\":\"nikke\",\"imagePath\":\"1-Billy/subcategories/nikke.jpg\",\"creationDate\":\"2024-07-01T13:24:37.000Z\",\"modificationDate\":\"2024-07-01T13:24:37.000Z\"},\"amount\":\"19.51\"}]','','','2024-07-02 07:00:00','EXPENSE','2024-07-02 07:29:13','2024-07-02 07:29:13',NULL),(4,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":39,\"userId\":1,\"categoryId\":4,\"name\":\"Nikke\",\"type\":\"nikke\",\"imagePath\":\"1-Billy/subcategories/nikke.jpg\",\"creationDate\":\"2024-07-01T13:24:37.000Z\",\"modificationDate\":\"2024-07-01T13:24:37.000Z\"},\"amount\":\"9.74\"}]','','','2024-07-02 07:00:00','EXPENSE','2024-07-02 07:29:25','2024-07-02 07:29:25',NULL),(5,1,2,'[{\"category\":{\"id\":1,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Alimentations\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/categories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":1,\"userId\":1,\"categoryId\":1,\"name\":\"Alimentation\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/subcategories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"9.40\"}]','','','2024-07-01 10:45:00','EXPENSE','2024-07-02 08:13:28','2024-07-02 08:13:28',NULL),(6,1,2,'[{\"category\":{\"id\":1,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Alimentations\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/categories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":1,\"userId\":1,\"categoryId\":1,\"name\":\"Alimentation\",\"type\":\"FOOD\",\"imagePath\":\"1-Billy/subcategories/food.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"10.90\"}]','','','2024-07-02 10:45:00','EXPENSE','2024-07-02 10:57:37','2024-07-02 10:57:37',NULL),(7,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":53,\"userId\":1,\"categoryId\":4,\"name\":\"Spotify\",\"type\":\"spotify\",\"imagePath\":\"1-Billy/subcategories/spotify.webp\",\"creationDate\":\"2024-07-01T17:13:00.000Z\",\"modificationDate\":\"2024-07-01T17:13:43.000Z\"},\"amount\":\"10.99\"}]','','','2024-07-02 13:00:00','EXPENSE','2024-07-02 13:00:00','2024-07-02 13:00:00',NULL),(8,1,2,'[{\"category\":{\"id\":10,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Autre (Dépenses)\",\"type\":\"OTHER\",\"imagePath\":\"1-Billy/categories/other.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":46,\"userId\":1,\"categoryId\":10,\"name\":\"Banque\",\"type\":\"banque\",\"imagePath\":\"1-Billy/subcategories/banque.png\",\"creationDate\":\"2024-07-01T13:32:11.000Z\",\"modificationDate\":\"2024-07-01T13:32:11.000Z\"},\"amount\":\"4.28\"}]','','','2024-07-03 08:00:00','EXPENSE','2024-07-03 08:00:00','2024-07-03 08:00:00',NULL),(9,1,2,'[{\"category\":{\"id\":3,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/categories/transport.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"subCategory\":{\"id\":10,\"userId\":1,\"categoryId\":3,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/subcategories/transport.png\",\"creationDate\":\"2024-07-01T12:29:31.000Z\",\"modificationDate\":\"2024-07-01T12:29:31.000Z\"},\"amount\":\"86.40\"}]','','Navigo','2024-07-03 08:00:00','EXPENSE','2024-07-03 08:00:00','2024-07-03 08:00:00',NULL),(10,1,2,'[{\"category\":{\"id\":14,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Patreon\",\"type\":\"patreon\",\"imagePath\":\"1-Billy/categories/patreon.png\",\"creationDate\":\"2024-07-01T13:00:26.000Z\",\"modificationDate\":\"2024-07-01T13:00:26.000Z\"},\"subCategory\":{\"id\":38,\"userId\":1,\"categoryId\":14,\"name\":\"Recifense Cheers\",\"type\":\"recifense\",\"imagePath\":\"1-Billy/subcategories/recifense.png\",\"creationDate\":\"2024-07-01T13:07:07.000Z\",\"modificationDate\":\"2024-07-01T13:07:07.000Z\"},\"amount\":\"1.20\"}]','','','2024-07-03 08:00:00','EXPENSE','2024-07-03 08:00:00','2024-07-03 08:00:00',NULL);
/*!40000 ALTER TABLE `TRANSACTION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TRANSFER`
--

DROP TABLE IF EXISTS `TRANSFER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TRANSFER` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `USER_ID` int(20) NOT NULL,
  `SENDER_ID` int(20) NOT NULL,
  `RECEIVER_ID` int(20) NOT NULL,
  `AMOUNT` text DEFAULT NULL,
  `OTHER` text DEFAULT NULL,
  `TRANSFER_DATE` datetime NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  `DELETED_ON` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `SENDER_ID` (`SENDER_ID`),
  KEY `RECEIVER_ID` (`RECEIVER_ID`),
  CONSTRAINT `TRANSFER_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSFER_ibfk_2` FOREIGN KEY (`SENDER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSFER_ibfk_3` FOREIGN KEY (`RECEIVER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSFER`
--

LOCK TABLES `TRANSFER` WRITE;
/*!40000 ALTER TABLE `TRANSFER` DISABLE KEYS */;
/*!40000 ALTER TABLE `TRANSFER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `USER`
--

DROP TABLE IF EXISTS `USER`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `USER` (
  `ID` int(20) NOT NULL AUTO_INCREMENT,
  `CIVILITY` enum('MADAME','MONSIEUR') NOT NULL DEFAULT 'MADAME',
  `FIRST_NAME` varchar(45) NOT NULL,
  `LAST_NAME` varchar(45) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(100) NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER`
--

LOCK TABLES `USER` WRITE;
/*!40000 ALTER TABLE `USER` DISABLE KEYS */;
INSERT INTO `USER` VALUES (1,'MONSIEUR','Erwan','Billy','erwan.billy@hotmail.fr','$2b$10$SIfSyk18vN5h0tsaqsFzH.X6f.k5z/ur9ZyRg5ALfuP5lA0rzHiUi','2024-07-01 12:29:30','2024-07-01 12:29:30');
/*!40000 ALTER TABLE `USER` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ultrafastbudget'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-03 10:45:36
