-- phpMyAdmin SQL Dump
-- version 3.5.8.2
-- http://www.phpmyadmin.net
--
-- Host: sql303.byethost18.com
-- Generation Time: Feb 27, 2015 at 09:23 AM
-- Server version: 5.6.22-71.0
-- PHP Version: 5.3.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `b18_15917402_jserrorlogger`
--

-- --------------------------------------------------------

--
-- Table structure for table `browser_orientations`
--

CREATE TABLE IF NOT EXISTS `browser_orientations` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ORIENTATION_TYPE` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `browsers`
--

CREATE TABLE IF NOT EXISTS `browsers` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `BROWSER_NAME` varchar(30) NOT NULL,
  `BROWSER_VERSION` varchar(10) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `errors`
--

CREATE TABLE IF NOT EXISTS `errors` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `CLIENT_ID` int(11) NOT NULL,
  `BROWSER_ID` int(11) NOT NULL,
  `OS_ID` int(11) NOT NULL,
  `RESOLUTION_ID` int(11) NOT NULL,
  `BROWSER_ORIENTATION_ID` int(11) NOT NULL,
  `ERROR_TYPE_ID` int(11) NOT NULL,
  `MESSAGE` text NOT NULL,
  `FILE_NAME` varchar(250) NOT NULL,
  `LINE_NUMBER` smallint(6) NOT NULL,
  `COL_NUMBER` smallint(6) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `error_types`
--

CREATE TABLE IF NOT EXISTS `error_types` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ERROR_TYPE_NAME` varchar(30) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `OS`
--

CREATE TABLE IF NOT EXISTS `OS` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `OS_NAME` varchar(30) NOT NULL,
  `OS_VERSION` varchar(10) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `resolutions`
--

CREATE TABLE IF NOT EXISTS `resolutions` (
  `ID` int(11) NOT NULL DEFAULT '0',
  `WIDTH` smallint(6) NOT NULL,
  `HEIGHT` smallint(6) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
