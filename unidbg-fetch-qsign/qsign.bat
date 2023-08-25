@echo off

echo qsign fastboot
echo --------------------------
echo 1.start
echo 2.stop
echo 3.restart
echo --------------------------
echo 4.install
echo 5.uninstall
echo --------------------------
echo 6.exit
echo --------------------------
set /p var=Enter the number: 
if %var% == 1 winsw start winsw.xml
if %var% == 2 winsw stop winsw.xml
if %var% == 3 winsw restart winsw.xml
if %var% == 4 winsw install winsw.xml
if %var% == 5 winsw uninstall winsw.xml
if %var% == 6 echo exit
