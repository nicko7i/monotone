# monotone

Monotone is a web service that issues monotonically increasing build numbers.

Given a changeset identifier, monotone provides strictly monotonically
ascending build numbers.  It also retains a record of previous build numbers,
the associated changeset identifier and source repository, and a timestamp.

Monotone works with any version control system having a unique string to
represent a change set.

Docker images are available on [DockerHub](https://hub.docker.com/r/nicko7i/monotone/tags/).

# Usage

POSTing a hash or other changeset identifier to ``/changeset`` returns the newly allocated
build number in the response body.  If the changeset is already associated with
a build number, the previously allocated build number is returned.

```bash
build=$(curl -s -X POST http:my-server:8080/changeset/?hash=deadbeef)
echo ${build}
5
build=$(curl -s -X POST http:my-server:8080/changeset/?hash=deadbeef)
echo ${build}
5
```

A GET against that endpoint returns the most recent build number record:

```bash
curl -s -X GET http://my-server:8080/changeset
{"number":5,"hash":"deadbeef","date":"2018-09-08 22:27:29","repo":"backer"}
```

Providing the changeset ID returns the associated record:
```bash
curl -s -X GET http://my-server:8080/changeset?hash=bacon
{"number":3,"hash":"bacon","date":"2018-09-08 21:17:55","repo":"backer"}
```

Similarly, providing the build number returns the associated record: (implemented in v1.1)
```bash
curl -s -X GET http://my-server:8080/changeset?build=3
{"number":3,"hash":"bacon","date":"2018-09-08 21:17:55","repo":"backer"}
```

# Deploying

The following example runs the most recent "Version 1" release on port ``8080``.

The entire state of the service is contained in file ``/data/my-db.sqlite`` on the docker host.
``--restart unless-stopped`` ensures that the service will start and stop when docker itself
starts and stops, while ``systemctl enable docker`` ensures that docker itself
starts when the machine is booted. 

Note that the database file must exist before the service is started.

```bash
systemctl enable docker
docker pull nicko7i/monotone:1
mkdir -p /data
touch /data/my-db.sqlite
docker run -dit                               \
  -p 8080:3030                                \
  -e MONOTONE_SRC_REPO=my-project             \
  -v /data/my-db.sqlite:/data/monotone.sqlite \
  --restart unless-stopped                    \
  --name my-service-name                      \
  nicko7i/monotone:1
```

## Git integration

Tagging the *git* commit makes the build number visible in GUI tools and ensures the
association is retained even if the service database is lost.
```$bash
build=$(curl -s -X POST http:my-server:8080/changeset/?hash=deadbeef)
git tag -a -m "build-${build}" "build-${build}" 63b0a81cb26a31b08986c69bd050ade2315f2216
```

