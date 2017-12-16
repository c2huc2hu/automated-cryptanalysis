#!/usr/bin/env python

import subprocess
import shutil
import os

shutil.rmtree('output', ignore_errors=True)
os.mkdir('output')
subprocess.check_output('/usr/bin/time -f "%E" ./run > output/stdout.txt 2> output/stderr.txt)', timeout=5*60);

