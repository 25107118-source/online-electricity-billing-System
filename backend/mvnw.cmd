@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Maven Start Up Batch script
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM ----------------------------------------------------------------------------

@echo off
@setlocal EnableExtensions EnableDelayedExpansion

if not "%JAVA_HOME%"=="" goto hasJavaHome
echo Warning: JAVA_HOME not set in your environment. Attempting to use java from PATH...
where java >nul 2>&1
if %ERRORLEVEL% equ 0 goto okJava
echo Error: JAVA_HOME is not set and no 'java' command could be found in your PATH.
echo Please install JDK 17+ and set JAVA_HOME.
goto error

:hasJavaHome
set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
goto checkWrapper

:okJava
set "JAVA_EXE=java"

:checkWrapper
set "DIRNAME=%~dp0"
if "%DIRNAME%"=="" set "DIRNAME=."
set "WRAPPER_JAR=%DIRNAME%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROP=%DIRNAME%.mvn\wrapper\maven-wrapper.properties"

if exist "%WRAPPER_JAR%" goto runWrapper

echo Downloading Maven Wrapper...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar', '%WRAPPER_JAR%')}"
if %ERRORLEVEL% neq 0 (
    echo Failed to download maven-wrapper.jar automatically.
    echo Please install Apache Maven directly using: winget install Apache.Maven
    goto error
)

:runWrapper
"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%DIRNAME%" -jar "%WRAPPER_JAR%" %*
if %ERRORLEVEL% neq 0 goto error
goto end

:error
exit /b 1

:end
exit /b 0
