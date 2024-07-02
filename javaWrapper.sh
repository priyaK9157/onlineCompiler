#!/bin/bash
# Create a Java file from the provided code
echo "$1" > Main.java

# Compile the Java file
javac Main.java

# Run the Java class
java Main
