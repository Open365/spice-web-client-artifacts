#!/bin/bash

set -e
set -x
set -u

VERSION="$1"
FILE="$(ls eyeos-spice-client-"$VERSION"-*.tar.gz)"
EXTENSION="tar.gz"

#/usr/bin/mvn
/var/lib/jenkins/tools/hudson.tasks.Maven_MavenInstallation/default/bin/mvn \
        -q \
        deploy:deploy-file \
        -DrepositoryId=snapshots \
        -Dfile="$FILE" \
        -DgroupId=com.eyeos \
        -DartifactId=eyeos-spice-client \
        -Dversion="$VERSION"-SNAPSHOT \
        -Dpackaging="$EXTENSION" \
        -Durl='http://nexus.eyeosbcn.com:8081/nexus/content/repositories/snapshots' \
        -DuniqueVersion=false
