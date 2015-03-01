-- phpMyAdmin SQL Dump
-- version 4.2.7.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2015 at 03:29 AM
-- Server version: 5.6.17
-- PHP Version: 5.5.15

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `jserrorlogger`
--

-- --------------------------------------------------------

--
-- Table structure for table `browsers`
--

CREATE TABLE IF NOT EXISTS `browsers` (
`ID` int(11) NOT NULL,
  `BROWSER_NAME` varchar(100) NOT NULL,
  `BROWSER_VERSION` varchar(100) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=61 ;

-- --------------------------------------------------------

--
-- Table structure for table `browser_orientations`
--

CREATE TABLE IF NOT EXISTS `browser_orientations` (
`ID` int(11) NOT NULL,
  `ORIENTATION_TYPE` varchar(30) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=25 ;

-- --------------------------------------------------------

--
-- Table structure for table `errors`
--

CREATE TABLE IF NOT EXISTS `errors` (
`ID` int(11) NOT NULL,
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
  `displayed` tinyint(1) NOT NULL DEFAULT '0',
  `TIME` varchar(20) NOT NULL,
  `LANG` varchar(10) DEFAULT NULL,
  `formatJson` text,
  `formatXml` text
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=579 ;

-- --------------------------------------------------------

--
-- Table structure for table `error_types`
--

CREATE TABLE IF NOT EXISTS `error_types` (
`ID` int(11) NOT NULL,
  `ERROR_TYPE_NAME` varchar(30) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=134 ;

-- --------------------------------------------------------

--
-- Table structure for table `os`
--

CREATE TABLE IF NOT EXISTS `os` (
`ID` int(11) NOT NULL,
  `OS_NAME` varchar(30) NOT NULL,
  `OS_VERSION` varchar(10) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=39 ;

-- --------------------------------------------------------

--
-- Table structure for table `resolutions`
--

CREATE TABLE IF NOT EXISTS `resolutions` (
`ID` int(11) NOT NULL,
  `WIDTH` smallint(6) NOT NULL,
  `HEIGHT` smallint(6) NOT NULL
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=46 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `browsers`
--
ALTER TABLE `browsers`
 ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `browser_orientations`
--
ALTER TABLE `browser_orientations`
 ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `errors`
--
ALTER TABLE `errors`
 ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `error_types`
--
ALTER TABLE `error_types`
 ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `os`
--
ALTER TABLE `os`
 ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `resolutions`
--
ALTER TABLE `resolutions`
 ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `browsers`
--
ALTER TABLE `browsers`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=61;
--
-- AUTO_INCREMENT for table `browser_orientations`
--
ALTER TABLE `browser_orientations`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=25;
--
-- AUTO_INCREMENT for table `errors`
--
ALTER TABLE `errors`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=579;
--
-- AUTO_INCREMENT for table `error_types`
--
ALTER TABLE `error_types`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=134;
--
-- AUTO_INCREMENT for table `os`
--
ALTER TABLE `os`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=39;
--
-- AUTO_INCREMENT for table `resolutions`
--
ALTER TABLE `resolutions`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=46;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
