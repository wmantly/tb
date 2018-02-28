# tb

* install `ffmpeg` with your system package manager.

* `npm install` to install the project

* change `res.locals.basePath` to a path a file path where your media is

* `npm start` to run the project defualt port is `3080`

## API

* `/api/info` **GET** returns codecs, fiilters and formats `ffmpeg` has available
  * 200 `{codecs: {4gv: {type: "audio", description: "4GV (Fourth Generation Vocoder)", canDecode: false, canEncode: false,…}},filters: {abuffer: {description: "Buffer audio frames, and make them accessible to the filterchain.", input: "none",…)},formats: {3g2: {description: "3GP2 (3GPP2 file format)", canDemux: true, canMux: true},…}}}`

* `api/list` **GET** returns a list of file and folders with information about each item
  * `dir` as a query paramater containing the directory to list.
 
  * 200 `{dir: "/stuff//", list: [{name: ".l.txt.swp", type: {type: "other"},…}, {name: "10000mb.bin", type: {type: "other"},…},…]}`
 
* `/api/fileData/:fileName` **GET** returns meta and codec data for the file
  * `fileName` The path and name for the requesting file.
  
  * 200 JSON oject with:
    * `filename` **String**
    * `file` **String** full file path
    * `fileext` **String** file extension
    * `filepath` **String** Directory of file
    * `probe_time` **Number**
    * `format` **Object**
      * `bit_rate` **Number**
      * `duration` **Number** Duration of media in seconds
      * `format_long_name` **String** 
      * `format_name` **String**
      * `nb_programs` **Number**
      * `nb_streams` **Number**
      * `probe_score` **Number**
      * `size` **Number** File size in bytes
      * `start_time` **Number**
    * `metadata` **Object**
      * `creation_time` **String**
      * `encoder` **String**
    * `streams` **Array** List of aduio and video streams in the file. Their can be 0 or more
      * **Object** Detailed information about the codec used.
  * 404 **JSON** requested file is not found
    * `{"message":"/stuff/torrents/Stargate.Origins.S01E03.720p.WEB.h264-TBS[eztv].mk: No such file or directory\n"}`
  * 415 **JSON** requested path is a directory
    * `{"message":"/stuff/torrents/: Is a directory\n"}`
