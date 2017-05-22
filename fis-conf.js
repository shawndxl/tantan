var package = require("./package.json");

/**
 * 全局变量
 */
fis
  .set('project.files', [ // 处理的文件类型
    '**.{css,less,html,php,js,png,jpg,gif,ico}'
  ])
  .set('project.ignore', [ // 忽略的文件
    'package.json',
    'node_modules/**',

    'bower.json',
    'bower_components/**',

    'inc/**',

    '**/_*.*',
    '_output', //不使用用

    'fis-conf.js',
    'sftp-config.json'
  ])
  .set('project.ext', {
    less: 'css',
    sass: 'css'
  });

fis
  .match(/\.less$/i, {
    rExt: '.css', // from .less to .css
    parser: [fis.plugin('jdists'), fis.plugin('less')]
  }).match(/\.(js|html|php|css)$/i, {
    parser: fis.plugin('jdists')
  }).match(/([^\/\\]+\.(css|less))$/i, {
    release: 'css/$1',
    postprocessor: fis.plugin('autoprefixer')
  });

/**
 * 本机测试版本
 */
fis.media('debug')
  .match(/\.(js|css|html|php)$/i, {
    parser: fis.plugin('jdists', {
      trigger: 'local'
    })
  });

function hostname() {
  var ip = false;
  var net = require('os').networkInterfaces();

  Object.keys(net).every(function(key) {
    var detail = net[key];
    Object.keys(detail).every(function(i) {
      var address = String(detail[i].address).trim();
      if (address && /^\d+(?:\.\d+){3}$/.test(address) && address !== '127.0.0.1') {
        ip = address;
      }
      return !ip; // 找到了，则跳出循环
    });
    return !ip; // 找到了，则跳出循环
  });
  return ip || 'unknown';
}

//----------------------------------
// @see open@0.0.4
var exec = require('child_process').exec;
var path = require('path');

/**
 * open a file or uri using the default application for the file type.
 *
 * @return {ChildProcess} - the child process object.
 * @param {string} target - the file/uri to open.
 * @param {string} appName - (optional) the application to be used to open the
 *      file (for example, "chrome", "firefox")
 * @param {function(Error)} callback - called with null on success, or
 *      an error object that contains a property 'code' with the exit
 *      code of the process.
 */

function open(target, appName, callback) {
  function escape(s) {
    return s.replace(/"/g, '\\\"');
  }

  var opener;

  if (typeof(appName) === 'function') {
    callback = appName;
    appName = null;
  }

  switch (process.platform) {
  case 'darwin':
    if (appName) {
      opener = 'open -a "' + escape(appName) + '"';
    } else {
      opener = 'open';
    }
    break;
  case 'win32':
    // if the first parameter to start is quoted, it uses that as the title
    // so we pass a blank title so we can quote the file we are opening
    if (appName) {
      opener = 'start "" "' + escape(appName) + '"';
    } else {
      opener = 'start ""';
    }
    break;
  default:
    if (appName) {
      opener = escape(appName);
    } else {
      // use Portlands xdg-open everywhere else
      opener = path.join(__dirname, '../vendor/xdg-open');
    }
    break;
  }

  return exec(opener + ' "' + escape(target) + '"', callback);
}

//-----------------------

var util = require('util');

function openUrl() {
  String(package.scripts.debug).replace(/-p\s*(\d+)\s*&&/, function(all, port) {
    setTimeout(function() {
      open(util.format('http://%s:%s/index.html', hostname(), port));
    });
  });
}

if (!(/-w?L/.test(process.argv)) &&
  fis.project.currentMedia() === 'debug') { // 存在监听
  fis.once('release:end', openUrl);
}