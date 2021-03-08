const Stream = require('stream');
const getInfo = require('./info');
const formatUtils = require('./format-utils');
const urlUtils = require('./url-utils');
const sig = require('./sig');
const miniget = require('miniget');

/**
 * @param {string} link
 * @param {!Object} options
 * @returns {ReadableStream}
 */
const ytdl = (link, options) => {
  const stream = createStream();
  ytdl.getInfo(link, options).then(info => {
    var goodVids = [];
    var qualitys = [];
    for (var i in info.formats) {
      if (info.formats[i].hasVideo && info.formats[i].hasAudio) {
        goodVids.push(info.formats[i]);
        qualitys.push(parseInt(info.formats[i].qualityLabel.split("p")[0],10));
      }
    };
    var bI = qualitys.indexOf(Math.max(...qualitys));
    miniget(info.formats[bI].url).pipe(stream);
    stream.emit('info', info);
  }).catch(err => {
    stream.emit('error', err);
  });
  return stream;
};
module.exports = ytdl;

ytdl.getBasicInfo = getInfo.getBasicInfo;
ytdl.getInfo = getInfo.getInfo;
ytdl.chooseFormat = formatUtils.chooseFormat;
ytdl.filterFormats = formatUtils.filterFormats;
ytdl.validateID = urlUtils.validateID;
ytdl.validateURL = urlUtils.validateURL;
ytdl.getURLVideoID = urlUtils.getURLVideoID;
ytdl.getVideoID = urlUtils.getVideoID;
ytdl.cache = {
  sig: sig.cache,
  info: getInfo.cache,
  watch: getInfo.watchPageCache,
  cookie: getInfo.cookieCache,
};


const createStream = options => {
  const stream = new Stream.PassThrough();
  stream._destroy = () => { stream.destroyed = true; };
  return stream;
};

ytdl.downloadFromInfo = (info, options) => {
  const stream = createStream(options);
  if (!info.full) {
    throw Error('Cannot use `ytdl.downloadFromInfo()` when called ' +
      'with info from `ytdl.getBasicInfo()`');
  }
  setImmediate(() => {
    var goodVids = [];
    var qualitys = [];
    for (var i in info.formats) {
      if (info.formats[i].hasVideo && info.formats[i].hasAudio) {
        goodVids.push(info.formats[i]);
        qualitys.push(info.formats[i].qualityLabel.split("p")[0]);
      }
    };
    let bI = qualitys.indexOf(Math.max(...qualitys));
    miniget(info.formats[bI].url).pipe(stream);
  });
  return stream;
};
