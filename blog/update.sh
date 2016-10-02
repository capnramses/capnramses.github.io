#!/bin/bash
opf="../navbar.js";
cd posts
rm $opf -f
echo "document.write('\\" >> $opf
echo "<ul>\\" >> $opf
#reverse date order
for filename in `ls | sort -r`; do
	echo "<li>$filename</li>\\" >> $opf
	done;
echo "</ul>\\" >> $opf;
echo "');" >> $opf;
cd ..

mainopf="index.html";
rm $mainopf -f
echo "<html><head>" >> $mainopf;

echo "</head><body>" >> $mainopf;
echo "test content<br />" >> $mainopf;
echo "<script src=\"include_navbar.js\"></script>" >> $mainopf;
echo "</body></html>" >> $mainopf;
