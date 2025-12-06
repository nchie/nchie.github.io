---
title: "Re-Engineering the DualSense (Part 2)"
display_title: "Re-Engineering the DualSense"
display_subtitle: "Part 2: Analyzing the Controller"
unlisted: true
summary: 
comments: true
---

In the last post I went through the idea TODO

I asked ChatGPT to generate a basic high level analyzer for Saleae Logic 2 by attaching the datasheet of the IMU. It did not fill in all the registers I needed, so I went through all the transactions in Logic 2 and asked it to specifically fill them in, making sure to flip the first bit of each READ (TODO: explain why) to get its register. I then asked it to generate high-level human-readable summaries of each register read/write.


Boot-up sequence:
- READ 1 byte(s) – WHO_AM_I (0x75): [0x60] – WHO_AM_I OK (0x60)
- WRITE 1 byte(s) – SIGNAL_PATH_RESET (0x02): [0x10] – SIGNAL_PATH_RESET: software reset
- WRITE 1 byte(s) – DEVICE_CONFIG (0x01): [0x04] – DEVICE_CONFIG: 4-wire SPI, SPI mode 0/3
- WRITE 1 byte(s) – GYRO_CONFIG0 (0x20): [0x05] – GYRO_CONFIG0: FS = ±2000 dps, ODR = 1.6 kHz
- WRITE 1 byte(s) – ACCEL_CONFIG0 (0x21): [0x45] – ACCEL_CONFIG0: FS = ±4 g, ODR = 1.6 kHz (LN)
- WRITE 1 byte(s) – TEMP_CONFIG0 (0x22): [0x10] – TEMP_CONFIG0: temp DLPF 180 Hz
- WRITE 1 byte(s) – GYRO_CONFIG1 (0x23): [0x01] – GYRO_CONFIG1: gyro UI LPF 180 Hz
- WRITE 1 byte(s) – ACCEL_CONFIG1 (0x24): [0x41] – ACCEL_CONFIG1: LP mode averaging = 32× avg, UI LPF 180 Hz
- WRITE 1 byte(s) – PWR_MGMT0 (0x1F): [0x0F] – PWR_MGMT0: gyro mode = low-noise (LN); accel mode = low-noise (LN); IDLE allows RC oscillator off; accel LP clock = wake-up oscillator
- WRITE 1 byte(s) – INT_CONFIG (0x06): [0x02] – INT_CONFIG: INT1: active-low, push-pull, pulsed; INT2: active-low, open-drain, pulsed
- WRITE 1 byte(s) – INT_SOURCE0 (0x2B): [0x08] – INT_SOURCE0: INT1 sources = Data ready
- WRITE 1 byte(s) – DRIVE_CONFIG3 (0x05): [0x04] – DRIVE_CONFIG3: SPI slew rate 2–6 ns


Some interesting notes from this:
- 2000 dps
- 1.6 kHz
- Interrupts configured for DATA_READY
- TODO: Gyro configured to use LPF?
- TODO: What is temp DLPF?


And  after this we see repeating reads similar to this one to get the gyro data:

```
READ 14 byte(s) – TEMP_DATA1 (0x09): [0xFE 0xA7 0x06 0xEF 0x05 0xB6 0xE2 0x37 0xFF 0xE8 0xFF 0xE7 0x00 0x07] – TEMP_DATA: ≈ 22.30 °C; ACCEL: X=+1775 (+0.217 g, +2.125 m/s²), Y=+1462 (+0.178 g, +1.750 m/s²), Z=-7625 (-0.931 g, -9.128 m/s²); GYRO: X=-24 (-1.463 °/s), Y=-25 (-1.524 °/s), Z=+7 (+0.427 °/s)
```

Initially this happens at quite irregular intervals, anywhere from 167ns to 812ns (though most around 400-650ns) between reads which is likely due to the MCU also handling other things early on, but after a while it stabilizes at 625ns which matches the 1.6kHz setting we saw during the initialization.
