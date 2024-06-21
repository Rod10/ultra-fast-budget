-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: ultrafastbudget
-- ------------------------------------------------------
-- Server version	5.7.42-0ubuntu0.18.04.1

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
  `NAME` varchar(45) NOT NULL,
  `CURRENCY` enum('EUR','USD','JPY','CNY') NOT NULL DEFAULT 'EUR',
  `TYPE` enum('WALLET','COURANT','LIVRETA','LDDS','LEP','LIVRETJ','CEL','PEL','PERP','CSL') NOT NULL DEFAULT 'WALLET',
  `INITIAL_BALANCE` float NOT NULL,
  `BALANCE` float NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  CONSTRAINT `ACCOUNT_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ACCOUNT`
--

LOCK TABLES `ACCOUNT` WRITE;
/*!40000 ALTER TABLE `ACCOUNT` DISABLE KEYS */;
INSERT INTO `ACCOUNT` VALUES (1,1,'Portefeuille','EUR','WALLET',60,60,'2024-06-18 07:27:56','2024-06-18 07:27:56'),(2,1,'Compte Courant','EUR','COURANT',2432.54,2432.54,'2024-06-18 07:27:56','2024-06-18 07:27:56'),(3,1,'Livret A','EUR','LIVRETA',23068.3,23068.3,'2024-06-18 07:27:56','2024-06-18 07:27:56'),(4,1,'LEP','EUR','LEP',4530,4530,'2024-06-18 07:27:56','2024-06-18 07:27:56'),(5,1,'PEL','EUR','PEL',3268.27,3268.27,'2024-06-18 07:27:56','2024-06-18 07:27:56');
/*!40000 ALTER TABLE `ACCOUNT` ENABLE KEYS */;
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
  `DATA` text,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `CATEGORY_ID` (`CATEGORY_ID`),
  CONSTRAINT `BUDGET_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `BUDGET_ibfk_2` FOREIGN KEY (`CATEGORY_ID`) REFERENCES `CATEGORY` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CATEGORY`
--

LOCK TABLES `CATEGORY` WRITE;
/*!40000 ALTER TABLE `CATEGORY` DISABLE KEYS */;
INSERT INTO `CATEGORY` VALUES (1,1,'OUTCOME','Alimentations','FOOD','1-Billy/categories/food.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(2,1,'OUTCOME','Courses','SHOPPING','1-Billy/categories/shopping.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(3,1,'OUTCOME','Transport','TRANSPORT','1-Billy/categories/transport.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(4,1,'OUTCOME','Divertissement','ENTERTAINMENT','1-Billy/categories/entertainment.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(5,1,'OUTCOME','Maison','HOME','1-Billy/categories/home.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(6,1,'OUTCOME','Famille','FAMILY','1-Billy/categories/family.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(7,1,'OUTCOME','Santé/Sport','HEALTH','1-Billy/categories/health.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(8,1,'OUTCOME','Voyage','TRAVEL','1-Billy/categories/travel.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(9,1,'OUTCOME','Animaux de compagnie','PET','1-Billy/categories/pet.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(10,1,'OUTCOME','Autre (Dépenses)','OTHER','1-Billy/categories/other.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(11,1,'INCOME','Autre (Revenus)','OTHER_INCOME','1-Billy/categories/other_income.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(12,1,'INCOME','Revenus financier','FINANCIAL','1-Billy/categories/financial.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(13,1,'INCOME','Revenus','INCOME','1-Billy/categories/income.png','2024-06-18 07:27:56','2024-06-18 07:27:56');
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
  `DATA` text,
  `TO` text,
  `OTHER` text,
  `TRANSACTION_DATE` datetime NOT NULL,
  `TYPE` enum('INCOME','EXPECTED_INCOME','EXPENSE','EXPECTED_EXPENSE','TRANSFER','EXPECTED_TRANSFERT','INTEREST') NOT NULL DEFAULT 'EXPENSE',
  `OCCURENCE` int(20) NOT NULL,
  `UNIT` enum('YEAR','MONTH','WEEK','DAY') NOT NULL DEFAULT 'MONTH',
  `NUMBER` int(20) NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `ACCOUNT_ID` (`ACCOUNT_ID`),
  CONSTRAINT `PLANNED_TRANSACTION_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `PLANNED_TRANSACTION_ibfk_2` FOREIGN KEY (`ACCOUNT_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PLANNED_TRANSACTION`
--

LOCK TABLES `PLANNED_TRANSACTION` WRITE;
/*!40000 ALTER TABLE `PLANNED_TRANSACTION` DISABLE KEYS */;
INSERT INTO `PLANNED_TRANSACTION` VALUES (1,1,2,'[{\"category\":{\"id\":13,\"genre\":\"INCOME\",\"userId\":1,\"name\":\"Revenus\",\"type\":\"INCOME\",\"imagePath\":\"1-Billy/categories/income.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":34,\"userId\":1,\"categoryId\":13,\"name\":\"Salaire\",\"type\":\"SALARY\",\"imagePath\":\"1-Billy/subcategories/salary.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"amount\":\"1841.83\"}]','','','2024-07-01 08:00:00','EXPECTED_INCOME',0,'MONTH',0,'2024-06-18 07:36:01','2024-06-18 07:36:01'),(2,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":39,\"userId\":1,\"categoryId\":4,\"name\":\"Patreon\",\"type\":\"patreon\",\"imagePath\":\"1-Billy/subcategories/patreon.png\",\"creationDate\":\"2024-06-18T07:29:50.000Z\",\"modificationDate\":\"2024-06-18T07:29:50.000Z\"},\"amount\":\"1.20\"}]','','','2024-07-01 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:37:17','2024-06-18 07:37:17'),(3,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":40,\"userId\":1,\"categoryId\":4,\"name\":\"Spotify\",\"type\":\"spotify\",\"imagePath\":\"1-Billy/subcategories/spotify.svg\",\"creationDate\":\"2024-06-18T07:30:08.000Z\",\"modificationDate\":\"2024-06-18T07:30:08.000Z\"},\"amount\":\"10.99\"}]','','','2024-07-02 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:38:02','2024-06-18 07:38:02'),(4,1,2,'[{\"category\":{\"id\":3,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/categories/transport.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":9,\"userId\":1,\"categoryId\":3,\"name\":\"Transport\",\"type\":\"TRANSPORT\",\"imagePath\":\"1-Billy/subcategories/transport.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"amount\":\"86.40\"}]','','','2024-07-04 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:38:42','2024-06-18 07:38:42'),(5,1,2,'[{\"category\":{\"id\":6,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Famille\",\"type\":\"FAMILY\",\"imagePath\":\"1-Billy/categories/family.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":41,\"userId\":1,\"categoryId\":6,\"name\":\"Loyer\",\"type\":\"loyer\",\"imagePath\":\"1-Billy/subcategories/loyer.png\",\"creationDate\":\"2024-06-18T07:30:48.000Z\",\"modificationDate\":\"2024-06-18T07:30:48.000Z\"},\"amount\":\"300\"}]','','','2024-07-05 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:44:49','2024-06-18 07:44:49'),(6,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":43,\"userId\":1,\"categoryId\":4,\"name\":\"Sankaku\",\"type\":\"sankaku\",\"imagePath\":\"1-Billy/subcategories/sankaku.png\",\"creationDate\":\"2024-06-18T07:33:53.000Z\",\"modificationDate\":\"2024-06-18T07:33:53.000Z\"},\"amount\":\"9.99\"}]','','','2024-07-05 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:45:28','2024-06-18 07:45:28'),(7,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":44,\"userId\":1,\"categoryId\":4,\"name\":\"Steam\",\"type\":\"steam\",\"imagePath\":\"1-Billy/subcategories/steam.svg\",\"creationDate\":\"2024-06-18T07:34:15.000Z\",\"modificationDate\":\"2024-06-18T07:34:15.000Z\"},\"amount\":\"7.99\"}]','','','2024-07-05 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:46:01','2024-06-18 07:46:01'),(8,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":38,\"userId\":1,\"categoryId\":4,\"name\":\"Discord\",\"type\":\"discord\",\"imagePath\":\"1-Billy/subcategories/discord.png\",\"creationDate\":\"2024-06-18T07:29:29.000Z\",\"modificationDate\":\"2024-06-18T07:29:29.000Z\"},\"amount\":\"4.99\"}]','','Rod24','2024-07-14 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:46:39','2024-06-18 07:47:27'),(9,1,2,'[{\"category\":{\"id\":4,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Divertissement\",\"type\":\"ENTERTAINMENT\",\"imagePath\":\"1-Billy/categories/entertainment.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":38,\"userId\":1,\"categoryId\":4,\"name\":\"Discord\",\"type\":\"discord\",\"imagePath\":\"1-Billy/subcategories/discord.png\",\"creationDate\":\"2024-06-18T07:29:29.000Z\",\"modificationDate\":\"2024-06-18T07:29:29.000Z\"},\"amount\":\"9.99\"}]','','','2024-06-24 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:46:57','2024-06-18 07:46:57'),(10,1,2,'[{\"category\":{\"id\":5,\"genre\":\"OUTCOME\",\"userId\":1,\"name\":\"Maison\",\"type\":\"HOME\",\"imagePath\":\"1-Billy/categories/home.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"subCategory\":{\"id\":21,\"userId\":1,\"categoryId\":5,\"name\":\"Facture téléphonique\",\"type\":\"PHONEBILL\",\"imagePath\":\"1-Billy/subcategories/phonebill.png\",\"creationDate\":\"2024-06-18T07:27:56.000Z\",\"modificationDate\":\"2024-06-18T07:27:56.000Z\"},\"amount\":\"31.99\"}]','','Portable','2024-06-28 08:00:00','EXPECTED_EXPENSE',0,'MONTH',0,'2024-06-18 07:50:05','2024-06-18 07:50:05');
/*!40000 ALTER TABLE `PLANNED_TRANSACTION` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SUBCATEGORY`
--

LOCK TABLES `SUBCATEGORY` WRITE;
/*!40000 ALTER TABLE `SUBCATEGORY` DISABLE KEYS */;
INSERT INTO `SUBCATEGORY` VALUES (1,1,1,'Alimentation','FOOD','1-Billy/subcategories/food.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(2,1,9,'Alimentation','FOOD','1-Billy/subcategories/food.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(3,1,1,'Restaurant','RESTAURANT','1-Billy/subcategories/restaurant.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(4,1,1,'Bar','BAR','1-Billy/subcategories/bar.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(5,1,2,'Courses','SHOPPING','1-Billy/subcategories/shopping.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(6,1,2,'Vêtements','CLOTHES','1-Billy/subcategories/clothes.png ','2024-06-18 07:27:56','2024-06-18 07:27:56'),(7,1,2,'Chaussure','SHOES','1-Billy/subcategories/shoes.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(8,1,2,'Cadeaux','GIFT','1-Billy/subcategories/gift.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(9,1,3,'Transport','TRANSPORT','1-Billy/subcategories/transport.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(10,1,3,'Voiture','CAR','1-Billy/subcategories/car.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(11,1,2,'Technologie','TECHNOLOGY','1-Billy/subcategories/techo.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(12,1,3,'Carburant','FUEL','1-Billy/subcategories/fuel.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(13,1,3,'Assurance','INSURANCE','1-Billy/subcategories/insurance.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(14,1,8,'Transport','TRANSPORT','1-Billy/subcategories/transport.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(15,1,4,'Divertissement','ENTERTAINMENT','1-Billy/subcategories/entertainment.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(16,1,4,'Livres/Revues','BOOKS','1-Billy/subcategories/books.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(17,1,5,'Maison','HOUSE','1-Billy/subcategories/home.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(18,1,5,'Loyer','RENT','1-Billy/subcategories/rent.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(19,1,5,'Facture d\'énergie','ENERGYBILL','1-Billy/subcategories/energybill.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(20,1,5,'Facture d\'eau','WATERBILL','1-Billy/subcategories/waterbill.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(21,1,5,'Facture téléphonique','PHONEBILL','1-Billy/subcategories/phonebill.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(22,1,6,'Famille','FAMILY','1-Billy/subcategories/family.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(23,1,6,'Enfants','KIDS','1-Billy/subcategories/kids.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(24,1,6,'Education','EDUCATION','1-Billy/subcategories/education.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(25,1,7,'Santé','HEALTH','1-Billy/subcategories/health.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(26,1,9,'Santé','HEALTH','1-Billy/subcategories/health.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(27,1,7,'Sport','SPORT','1-Billy/subcategories/sport.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(28,1,8,'Voyage','TRAVEL','1-Billy/subcategories/travel.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(29,1,8,'Logement','HOUSING','1-Billy/subcategories/home.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(30,1,11,'Autre (Revenues)','OTHERS','1-Billy/subcategories/other_income.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(31,1,10,'Impôts','TAX','1-Billy/subcategories/tax.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(32,1,10,'Cigarettes','CIGARETTE','1-Billy/subcategories/cigarettes.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(33,1,12,'Revenues financiers','INCOME','1-Billy/subcategories/financial.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(34,1,13,'Salaire','SALARY','1-Billy/subcategories/salary.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(35,1,13,'Petits boulots','SMALLJOB','1-Billy/subcategories/smalljob.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(36,1,13,'Pension','PENSION','1-Billy/subcategories/pension.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(37,1,11,'Epargne','SAVING','1-Billy/subcategories/saving.png','2024-06-18 07:27:56','2024-06-18 07:27:56'),(38,1,4,'Discord','discord','1-Billy/subcategories/discord.png','2024-06-18 07:29:29','2024-06-18 07:29:29'),(39,1,4,'Patreon','patreon','1-Billy/subcategories/patreon.png','2024-06-18 07:29:50','2024-06-18 07:29:50'),(40,1,4,'Spotify','spotify','1-Billy/subcategories/spotify.svg','2024-06-18 07:30:08','2024-06-18 07:30:08'),(41,1,6,'Loyer','loyer','1-Billy/subcategories/loyer.png','2024-06-18 07:30:48','2024-06-18 07:30:48'),(42,1,10,'Coalition Plus','coalition','1-Billy/subcategories/coalition.png','2024-06-18 07:33:28','2024-06-18 07:33:28'),(43,1,4,'Sankaku','sankaku','1-Billy/subcategories/sankaku.png','2024-06-18 07:33:53','2024-06-18 07:33:53'),(44,1,4,'Steam','steam','1-Billy/subcategories/steam.svg','2024-06-18 07:34:15','2024-06-18 07:34:15'),(45,1,4,'Nikke','nikke','1-Billy/subcategories/nikke.jpg','2024-06-18 07:34:27','2024-06-18 07:34:27'),(46,1,4,'Azur Lane','azur-lane','1-Billy/subcategories/azur-lane.png','2024-06-18 07:34:43','2024-06-18 07:34:43'),(47,1,4,'Enlisted','enlisted','1-Billy/subcategories/enlisted.png','2024-06-18 07:34:55','2024-06-18 07:34:55'),(48,1,4,'War Thunder','war-thunder','1-Billy/subcategories/war-thunder.png','2024-06-18 07:35:14','2024-06-18 07:35:14');
/*!40000 ALTER TABLE `SUBCATEGORY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SequelizeMeta`
--

DROP TABLE IF EXISTS `SequelizeMeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `SequelizeMeta` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SequelizeMeta`
--

LOCK TABLES `SequelizeMeta` WRITE;
/*!40000 ALTER TABLE `SequelizeMeta` DISABLE KEYS */;
INSERT INTO `SequelizeMeta` VALUES ('20240506000000-create-user.js'),('20240506000001-create-category.js'),('20240506000002-create-subcategory.js'),('20240506000003-create-account.js'),('20240506000004-create-transaction.js'),('20240506000005-create-budget.js'),('20240530100031-create-plannified-transaction.js'),('20240603134554-create-transfer.js');
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
  `DATA` text,
  `TO` text,
  `OTHER` text,
  `TRANSACTION_DATE` datetime NOT NULL,
  `TYPE` enum('INCOME','EXPECTED_INCOME','EXPENSE','EXPECTED_EXPENSE','TRANSFER','EXPECTED_TRANSFERT','INTEREST') NOT NULL DEFAULT 'EXPENSE',
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `ACCOUNT_ID` (`ACCOUNT_ID`),
  CONSTRAINT `TRANSACTION_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSACTION_ibfk_2` FOREIGN KEY (`ACCOUNT_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TRANSACTION`
--

LOCK TABLES `TRANSACTION` WRITE;
/*!40000 ALTER TABLE `TRANSACTION` DISABLE KEYS */;
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
  `AMOUNT` text,
  `OTHER` text,
  `TRANSFER_DATE` datetime NOT NULL,
  `CREATION_DATE` datetime NOT NULL,
  `MODIFICATION_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `USER_ID` (`USER_ID`),
  KEY `SENDER_ID` (`SENDER_ID`),
  KEY `RECEIVER_ID` (`RECEIVER_ID`),
  CONSTRAINT `TRANSFER_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `USER` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSFER_ibfk_2` FOREIGN KEY (`SENDER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TRANSFER_ibfk_3` FOREIGN KEY (`RECEIVER_ID`) REFERENCES `ACCOUNT` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `USER`
--

LOCK TABLES `USER` WRITE;
/*!40000 ALTER TABLE `USER` DISABLE KEYS */;
INSERT INTO `USER` VALUES (1,'MONSIEUR','Erwan','Billy','erwan.billy@hotmail.fr','$2b$10$75.x1yyFQFuIpPieeSO48uzXaesf9amkqZ6hOfJ2RSR4lILVyLUdm','2024-06-18 07:27:56','2024-06-18 07:27:56');
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

-- Dump completed on 2024-06-18 10:11:55
