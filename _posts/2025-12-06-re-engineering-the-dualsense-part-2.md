---
title: "Re-Engineering the DualSense (Part 2)"
display_title: "Re-Engineering the DualSense"
display_subtitle: "Part 2: Analyzing the Controller"
unlisted: true
summary: 
comments: true
---

In the last post I went through the idea I've had, some basic investigation, and a shopping list of things which I ordered to be able to take it further. In this post I will be going through soldering, analyzing the communication between the DualSense MCU and its IMU, as well as a plan on how we can design a mod around it.


### Practicing

As I mentioned previously, my soldering experience is almost non-existent and in the past I've ended up bricking things. This time I wanted to learn it properly so took some time to practice soldering components onto SMD practice boards. After getting the basics down I ended up buying a cheap malfunctioning (stick drift) controller to practice on (revision 2, BDM-020), and to my surprise I found it much easier than I had imagined to solder thin wires to (random) test pads. While at it I decided I wanted to continue on the BDM-020 a little bit more, but the BDM-020 doesn't have any obvious test pads for the IMU, so I scraped some vias hoping to find pads which had continuity to the IMU. Sadly could not find any, and therefore I ended up soldering wires to the vias instead to analyze the communication between the MCU and IMU.

[TODO: Insert picture IMG_3522.jpeg here]

I won't go into much detail regarding the BDM-020 but I will say that it's very similar except it's using a older but slightly higher specced IMU: The InvenSense ICM-40608. I will however be mentioning some differences I've found between how the BDM-020 and the BDM-050 use their IMUs as we go.


### Soldering

Soldering was surprisingly easy with a small enough tip (0.2mm conical) and some decent (lead-free) 0.35mm solder - I didn't even really need the extra flux. I made my own test probes by attaching 38 AWG enamelled wires to 30 AWG PVC wires using solder, and then soldering the PVC wires to Dupont headers because I don't have a crimp tool. I then wetted the test pads as well as the enamelled wire, shaped the end of the wire into a "hook" (I found the joints to be much more durable when doing this) and simply connected them as the test pad's solder was molten. I then put some kapton tape on top of it to make it a little bit more durable.


[TODO: Insert picture IMG_3637.jpeg and IMG_3653.jpeg here]


### Analyzing
[TODO: Insert picture IMG_3634.jpeg or IMG_3649.jpeg here]

[TODO: Insert video IMG_3651.MOV here?]

TODO: Finding clock rate and protocol

By looking at the signals in Logic 2 we can see that the CS (Enable (TODO: Add description)) wire is going low when the other wires are active - CS would have been constant if it was I²C, so the assumption regarding SPI being used seems correct. Now we need to figure out which SPI mode is being used which means we need to know 2 things:
- CPOL: In what state does the CLK (TODO: Add description) wire idle?
  - This is very easy to see: It's idling high, meaning CPOL = 1.
- CPHA: Is the data from MISO/MOSI (TODO: Add descriptions) wires sampled on the leading edge (falling for CPOL = 1) or trailing edge (rising for CPOL = 1)?
  - Since I know that the response to WHO_AM_I should be 0x60 from the datasheet, I set up an SPI analyzer in Logic 2, tried both settings, and found CPHA=1 to be the one which gave 0x60 on the MISO, meaning it's sampling on trailing edges.


<figure>
  <img width="452" src="/images/WHO_AM_I.png" alt="Capturing WHO_AM_I in Saleae Logic 2" data-lightbox data-lightbox-src="/images/WHO_AM_I.png" data-lightbox-caption="WHO_AM_I capture: 0xF5 means read 0x75 (WHO_AM_I), response 0x60">
  <figcaption>The very first command is `0xF5`, but the first bit tells whether it's a read (1) or write (0), and the 7 remaining bits tells which register. `0xF5` therefore means `read 0x75 (WHO_AM_I)`, to which it gets the expected `0x60` back</figcaption>
</figure>

CPOL=1 and CPHA=1 means Mode 3. Now we can see the data going in and out, but we have to cross-reference everything between the datasheet and Logic 2 to undestand what's happening. Luckily Logic 2 supports extensions in which one can implement higher level analyzers on top of SPI. Since we live in the age of LLMs, I thought I'd attach the IMU's datasheet and ask ChatGPT to generate the extension for me, and with a little bit of back and forth I ended up with an extension that gave me human-readable summaries of all transactions seen in my capture (repository available here [TODO: Link to repo]).

These are the transaction summaries from capturing the boot-up sequence:

```
READ 1 byte(s) – WHO_AM_I (0x75): [0x60] – WHO_AM_I OK (0x60)
WRITE 1 byte(s) – SIGNAL_PATH_RESET (0x02): [0x10] – SIGNAL_PATH_RESET: software reset
WRITE 1 byte(s) – DEVICE_CONFIG (0x01): [0x04] – DEVICE_CONFIG: 4-wire SPI, SPI mode 0/3
WRITE 1 byte(s) – GYRO_CONFIG0 (0x20): [0x05] – GYRO_CONFIG0: FS = ±2000 dps, ODR = 1.6 kHz
WRITE 1 byte(s) – ACCEL_CONFIG0 (0x21): [0x45] – ACCEL_CONFIG0: FS = ±4 g, ODR = 1.6 kHz (LN)
WRITE 1 byte(s) – TEMP_CONFIG0 (0x22): [0x10] – TEMP_CONFIG0: temp DLPF 180 Hz
WRITE 1 byte(s) – GYRO_CONFIG1 (0x23): [0x01] – GYRO_CONFIG1: gyro UI LPF 180 Hz
WRITE 1 byte(s) – ACCEL_CONFIG1 (0x24): [0x41] – ACCEL_CONFIG1: LP mode averaging = 32× avg, UI LPF 180 Hz
WRITE 1 byte(s) – PWR_MGMT0 (0x1F): [0x0F] – PWR_MGMT0: gyro mode = low-noise (LN); accel mode = low-noise (LN); IDLE allows RC oscillator off; accel LP clock = wake-up oscillator
WRITE 1 byte(s) – INT_CONFIG (0x06): [0x02] – INT_CONFIG: INT1: active-low, push-pull, pulsed; INT2: active-low, open-drain, pulsed
WRITE 1 byte(s) – INT_SOURCE0 (0x2B): [0x08] – INT_SOURCE0: INT1 sources = Data ready
WRITE 1 byte(s) – DRIVE_CONFIG3 (0x05): [0x04] – DRIVE_CONFIG3: SPI slew rate 2–6 ns
```

Some interesting notes from this:
- 2000 dps, a _lot_ higher than the Alpakka which does 125 and 500.
- 1.6 kHz
- Interrupts configured for DATA_READY
- TODO: Gyro configured to use LPF?
- TODO: What is temp DLPF?

After this we see repeating reads similar to this one to get the gyro data:

```
READ 14 byte(s) – TEMP_DATA1 (0x09): [0xFE 0xA7 0x06 0xEF 0x05 0xB6 0xE2 0x37 0xFF 0xE8 0xFF 0xE7 0x00 0x07] – TEMP_DATA: ≈ 22.30 °C; ACCEL: X=+1775 (+0.217 g, +2.125 m/s²), Y=+1462 (+0.178 g, +1.750 m/s²), Z=-7625 (-0.931 g, -9.128 m/s²); GYRO: X=-24 (-1.463 °/s), Y=-25 (-1.524 °/s), Z=+7 (+0.427 °/s)
```

Initially this happens at quite irregular intervals, anywhere from 167ns to 812ns (though most around 400-650ns) between reads which is likely due to the MCU also handling other things early on, but after a while it stabilizes at 625ns which matches the 1.6kHz setting we saw during the initialization.
