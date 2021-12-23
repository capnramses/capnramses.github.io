cd blog
./update.sh
cd ..
git add --all
git commit -m "$(date +%s)"
git push
