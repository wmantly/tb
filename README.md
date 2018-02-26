# tb

* install `ffmpeg` with your system package manager.

* `npm install` to install the project

* change `res.locals.basePath` to a path a file path where your media is

* `npm start` to run the project defualt port is `3080`

## API

* `/api/info` *GET* returns codeds and fiilters `ffmpeg` has available
  * 200 `{codecs: {4gv: {type: "audio", description: "4GV (Fourth Generation Vocoder)", canDecode: false, canEncode: false,…}},filters: {abuffer: {description: "Buffer audio frames, and make them accessible to the filterchain.", input: "none",…)},formats: {3g2: {description: "3GP2 (3GPP2 file format)", canDemux: true, canMux: true},…}}}`
