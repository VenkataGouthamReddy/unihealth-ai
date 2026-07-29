@echo off
echo ==================================================
echo Deploying Updates to Vercel and Mobile App
echo ==================================================
echo.

echo 1. Adding changed files...
git add .

echo 2. Committing changes...
git commit -m "Auto-deploy update"

echo 3. Pushing to GitHub (This triggers Vercel)...
git push

echo.
echo ==================================================
echo SUCCESS! 
echo Vercel is now building your new changes.
echo Since your APK is linked to Vercel, your mobile app will automatically update as soon as Vercel finishes!
echo ==================================================
pause
