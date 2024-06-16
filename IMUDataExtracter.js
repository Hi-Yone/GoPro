// const names = {
//   ACCL: '3-axis accelerometer',
//   GYRO: '3-axis gyroscope',
//   ISOG: 'Image sensor gain',
//   SHUT: 'Exposure time',
//   GPS5: 'Latitude, longitude, altitude (WGS 84), 2D ground speed, and 3D speed',
//   GPS9: 'Lat., Long., Alt., 2D, 3D, days, secs, DOP, fix',
//   GPSU: 'UTC time and data from GPS',
//   GPSF: 'GPS Fix',
//   GPSP: 'GPS Precision - Dilution of Precision (DOP x100)',
//   STMP: 'Microsecond timestamps',
//   MAGN: 'Magnetometer',
//   FACE: 'Face detection boundaring boxes',
//   FCNM: 'Faces counted per frame',
//   ISOE: 'Sensor ISO',
//   ALLD: 'Auto Low Light frame Duration',
//   WBAL: 'White Balance in Kelvin',
//   WRGB: 'White Balance RGB gains',
//   YAVG: 'Luma (Y) Average over the frame',
//   HUES: 'Predominant hues over the frame',
//   UNIF: 'Image uniformity',
//   SCEN: 'Scene classifier in probabilities'
// };

// __dirname : カレントディレクトリまでの絶対パス
const goproTelemetry = require(`${__dirname}/gopro-telemetry-master/`);
const fs = require('fs');

// 関数：動画ファイル(MP4)を読み込み，rawDataに変換する->(.bin)
function MP4toRaw(InputFile, OutputFile) {
  try {
    // ffmpegの実行
    const ffmpegCommand = `ffmpeg -y -i ${InputFile} -codec copy -map 0:3 -f rawvideo ${OutputFile}`;
    execSync(ffmpegCommand, { encoding: 'utf-8' });
    console.log('.bin file generated')
  
  } catch (error) {
    console.log(error);
  }
}

// 関数：rawDataを読み込み，人間が理解可能な形式に変換する->(.json)
async function toJSON(InputFile, OutputFile) {
  try {
    const file = fs.readFileSync(InputFile);
    const result = await goproTelemetry(
      { rawData: file },
      {
        stream: ['GYRO', 'ACCL'],
        repeatSticky: false,
        repeatHeaders: false
      }
    );
    fs.writeFileSync(OutputFile, JSON.stringify(result));
    console.log('File saved');
    
  } catch (error) {
    console.error(error);
  }
}



// main loop
const { execSync } = require('child_process');      // child_processモジュール読み込み
const path = require('path');                       // pathモジュール読み込み

const fileList_left = fs.readdirSync(path.join(__dirname, 'movies/left/')).filter(function(x) {
  return x !== '.DS_Store' &&
         x !== '.git' &&
         x !== '.svn' &&
         x !== 'ignore-other-file.js';});           // 保存された動画ファイルを取得
console.log('movie file list (left) : '+fileList_left);

const fileList_right = fs.readdirSync(path.join(__dirname, 'movies/right/')).filter(function(x) {
  return x !== '.DS_Store' &&
         x !== '.git' &&
         x !== '.svn' &&
         x !== 'ignore-other-file.js';});           // 保存された動画ファイルを取得
console.log('movie file list (right) : '+fileList_right);


try {
  if (fileList_left.length !== fileList_right.length) {       // 左右で動画数が異なる場合はエラー
      throw new Error('The number of files does not match.');
  }
  filenum = fileList_left.length;                   // ファイル数を格納
  console.log('number of movie files' + filenum + '.')
  console.log('===== Continue running. ====')

} catch (e) {
  console.log(e.message);
} 

// 動画ファイルを読み込み，Json形式でジャイロデータを取得する
let rawPath_left = './rawData_left.bin'
let rawPath_right = './rawData_right.bin'

for (let ii=0; ii<filenum; ii++){
  // 左目：MP4 -> rawDataに変換
  let movName_left = fileList_left[ii]
  let movPath_left = path.join(__dirname, 'movies/left/', movName_left)
  let outputPath_left = './outputs/IMUdata_' + path.parse(movName_left).name + '_left.json'

  MP4toRaw(movPath_left, rawPath_left);
  toJSON(rawPath_left, outputPath_left); // 左目：ffmpegコマンドで変換された動画のバイナリファイルを読み込む
  
  // 右目：MP4 -> rawDataに変換
  let movName_right = fileList_right[ii]
  let movPath_right = path.join(__dirname, 'movies/right/', movName_right)
  let outputPath_right = './outputs/IMUdata_' + path.parse(movName_right).name + '_right.json'

  MP4toRaw(movPath_right, rawPath_right)
  toJSON(rawPath_right, outputPath_right); // 右目：ffmpegコマンドで変換された動画のバイナリファイルを読み込む
}

fs.unlinkSync(rawPath_left);
fs.unlinkSync(rawPath_right);
console.log('.bin file removed')
