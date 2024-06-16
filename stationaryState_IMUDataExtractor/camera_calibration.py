import numpy as np
import matplotlib.pyplot as plt
import json

# def calib_func():
#     for ii in range()

# axy, axz, ayz = 
# sx, sy, sz = 
# ox, oy,oz = 

# Tmat = np.array([[1, -axy, axz],
#                  [0, 1, -ayz],
#                  [0, 0, 1]])

# Smat = np.array([[sx, 0, 0], 
#                  [0, sy, 0], 
#                  [0, 0, sz]])

# acc_xyz = np.array([[],
#                     [],
#                     [],
#                     [],
#                     [],
#                     [],
#                     [],
#                     [],
#                     [],
#                     []])

# param_theta = np.array([axy, axz, ayz, sx, sy, sz, ox, oy, oz]).T

# mat = np.array([])

# pose_N = 30
# theta = opt.leastsq()


# キャリブレーション関数
def calibrate_sensor(num_samples, accl_avg, gyro_avg):
    # ダミーデータを使用してセンサのキャリブレーションを行う
    accl_bias = np.zeros(3)  # 加速度のバイアス
    gyro_bias = np.zeros(3)   # 角速度のバイアス
    accl_scale_factor = np.ones(3)  # 加速度のスケールファクター
    gyro_scale_factor = np.ones(3)   # 角速度のスケールファクター

    # 指定されたサンプル数のデータを収集して平均を計算する
    for nn in range(num_samples):
        accl_data = accl_avg[nn]
        gyro_data = gyro_avg[nn]

        # バイアスの更新
        accl_bias += accl_data
        gyro_bias += gyro_data

    # 平均を取る
    accl_bias /= num_samples
    gyro_bias /= num_samples

    # 推定されたバイアスを表示
    print("Estimated Acclerometer Bias:", accl_bias)
    print("Estimated Gyroscope Bias:", gyro_bias)

    # センサからのデータを[-1, 1]の範囲に正規化する
    max_val = np.max(np.abs(accl_data))
    accl_scale_factor = max_val / accl_bias

    max_val = np.max(np.abs(gyro_data))
    gyro_scale_factor = max_val / gyro_bias

    # 推定されたスケールファクターを表示
    print("Estimated Acclerometer Scale Factor:", accl_scale_factor)
    print("Estimated Gyroscope Scale Factor:", gyro_scale_factor)

    # バイアスとスケールファクターを返す
    return accl_bias, gyro_bias, accl_scale_factor, gyro_scale_factor


accl_avg = np.zeros((30, 3), dtype=np.float32)
for ii in range(30):
    path = f'/Users/yonekawahiroto/Sanada_lab/研究/gopro_local/camera_calibration/sensor_datas/GyroData_{ii+1}.json'  # センサデータのパス

    file = open(path, 'rb').read()                  # ファイルを開く
    data = json.loads(file.decode('utf-8'))         # jsonファイルをデコード
    data = data['1']['streams']['ACCL']['samples']  # 加速度データのみ抽出
    
    dataSize = len(data)                            # データの行数
    data_sum = np.zeros(3)                          # 加速度データの合計を格納する配列
    for jj in range(dataSize):
        data_sum += data[jj]['value']

    accl_avg[ii] = data_sum/dataSize                # ファイル中の加速度データの平均

gyro_avg = np.zeros((30, 3), dtype=np.float32)
for ii in range(30):
    path = f'/Users/yonekawahiroto/Sanada_lab/研究/gopro_local/camera_calibration/sensor_datas/GyroData_{ii+1}.json'  # センサデータのパス

    file = open(path, 'rb').read()                  # ファイルを開く
    data = json.loads(file.decode('utf-8'))         # jsonファイルをデコード
    data = data['1']['streams']['GYRO']['samples']  # 角速度データのみ抽出
    
    dataSize = len(data)                            # データの行数
    data_sum = np.zeros(3)                          # 角速度データの合計を格納する配列
    for jj in range(dataSize):
        data_sum += data[jj]['value']

    gyro_avg[ii] = data_sum/dataSize                # ファイル中の角速度データの平均

# キャリブレーションを実行
accl_bias, gyro_bias, accl_scale_factor, gyro_scale_factor = calibrate_sensor(30, accl_avg=accl_avg, gyro_avg=gyro_avg)