# This script builds and copies the docker image to the deployment server.

echo 'Input version for docker image:'
read version

docker_image=billvog/bongocloudapi:$version

echo 'Status: Building' $docker_image '...'
docker buildx build --platform linux/amd64 -t $docker_image . --load

echo 'Status: Image built, copying it over SSH to billvog@bongoapi.bongo-cloud.ga ...'
docker save $docker_image | ssh -C -i ~/.ssh/id_rsa_voyager2 -p 8678 billvog@bongoapi.bongo-cloud.ga "docker load"