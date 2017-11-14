# replace me with your own script
start=`date +%s` # get start time. you don't need to include this

rm -rf output
mkdir output

# run your programs
node part1.js

echo "DONE EVERYTHING!"  # you can print whatever you want to stdout/ stderr

# get end time and print time taken. you don't need to include this
end=`date +%s`
runtime=$((end-start))
echo "took" $runtime "second(s)"