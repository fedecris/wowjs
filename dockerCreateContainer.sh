if [ "$#" -ne 2 ]; then
    echo "Se requiere nombre de container y puerto"
    exit 1;
fi
echo "Running image wowjs on container with name $1 on port $2"
docker run --name $1 -p $2:3000 wowjs
