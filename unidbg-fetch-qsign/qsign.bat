@echo off
echo 1.install
echo 2.start
echo 3.stop
echo 4.restart
echo 5.uninstall 
echo 6.exit
set /p var=Enter the number: 
if %var% == 1 winsw install winsw.xml
if %var% == 2 winsw start winsw.xml
if %var% == 3 winsw stop winsw.xml
if %var% == 4 winsw restart winsw.xml
if %var% == 5 winsw uninstall winsw.xml
if %var% == 6 echo exit