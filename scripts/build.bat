@echo off

echo Running the linter...
call linter.bat

echo Generating deps.js...
call gen-deps.bat

echo Build all JS...
call js.bat

echo Finished building everything.