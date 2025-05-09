# Guardian Angel

![Demo Screenshot](https://i.imgur.com/o3mfj0Z.png)


## Demo Video 🎥

[![Watch the demo video](https://img.youtube.com/vi/8Nj8ePU1TnI/0.jpg)](https://www.youtube.com/watch?v=8Nj8ePU1TnI)


## Introduction 📝

**Guardian Angel** is a proxemics-based program developed for the CPSC 581 Individual Assignment. The goal of this program is to support individuals with limited mobility and visibility—especially those who use a wheelchair—by helping them feel safer and more secure in their daily lives.

My inspiration for this program was my grandmother. In the later stages of her life, she suffered from Parkinson’s disease, arthritis, and cataracts, which significantly reduced her ability to walk, move, or see clearly. She spent most of her time navigating her care facility in a wheelchair.

Some of her major daily concerns included:

- **Falling and not being helped for a long time**, which made her hesitant to move around or do simple things like picking up objects or adjusting her position.
- **Falling out of bed while asleep**, especially since she avoided bed rails due to claustrophobia and difficulty getting in and out of bed. As a result, her bed was placed against a wall to reduce the chance of falling.
- **Running over objects or steps**, due to poor eyesight and limited neck mobility, which made it hard for her to notice obstacles in her path.
- **Theft while sleeping**, especially in common areas where guests might unknowingly enter her space and take items unnoticed.

This program addresses these specific issues through features like fall detection, sleep fall prevention, theft prevention, and object detection. The core motivation is to help individuals like my grandmother regain confidence and independence in their daily activities. For example:

- Solving the fear of falling empowers users to move around without waiting for a caregiver.
- Preventing bed falls enables more comfortable and restful sleep.
- Detecting obstacles builds confidence to venture outdoors.
- Theft detection reduces the anxiety of being on constant alert while resting.

## Features ⭐

The application includes the following features:

1. **General Fall Detection** – Detects if a fall has occurred. Users can cancel the alert if it's a false alarm; otherwise, it notifies emergency contacts.
2. **Sleep Fall Prevention** – Monitors the user's position on the bed. If the user nears the edge, a hidden bed rail automatically rises to prevent falls.
3. **Object Detection** – Scans the environment for obstacles. If the user approaches too closely, a warning and visual cue are shown.
4. **Anti-Theft Detection** – Monitors the user’s belongings. If an item disappears for several seconds, an alarm is triggered.

## Markers

These are the ArUco markers used for detection:

1. **ID 84** – Simulates object 1 (for object detection).
2. **ID 85** – Simulates object 2.
3. **ID 86** – Simulates object 3.
4. **ID 87** – Identifies the user.
5. **ID 88** – Marks a phone.
6. **ID 89** – Marks a set of car keys.

## How to Use 📚

**Original Source Code:** https://glitch.com/edit/#!/cpsc-581-individual-project

**Live Site:** https://cpsc-581-individual-project.glitch.me

1. **Two webcams are required.** If you see an error and have two cameras, ensure permissions are granted and restart your browser.

2. The program must be run on a computer (desktop, laptop, Surface, etc.)—**it will not work on mobile devices** due to operating system restrictions preventing access to both the front and rear cameras simultaneously.

3. Use this [link](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html?dictionary=ARUCO_MIP_36h12) to generate the six markers listed above. Print them at **70mm x 70mm**. If using a different size, adjust the `markerSize` variable (line 10 in `script.js`) accordingly.

4. Visit this link to try the program: [https://cpsc-581-individual-project.glitch.me](https://cpsc-581-individual-project.glitch.me).
   The five buttons at the bottom (from left to right) are: Sleep Fall Prevention, Fall Detection, Object Detection, Anti-Theft Mode, and Camera Switch.

    **Note 1:** All features work with both front and rear cameras (even simultaneously, if available).

    **Note 2:** This application is designed to run specifically on **Glitch**. Running it locally may cause issues because certain dependencies—such as hosted images, external scripts (e.g., js-aruco), and other resources are originally linked and configured to work within the Glitch environment.

5. **Sleep Fall Prevention:** When activated, the screen turns black with a clock, bed rail status, and exit button. The system uses marker **87** to detect the user's distance and raise/lower the rail accordingly. The rail status is shown via a status bar and screen border color.

6. **Fall Detection:** Once activated, the button border turns yellow while searching for marker **87**. When detected, the border turns green. If the user falls (marker disappears for a few seconds), an alert pops up. If not dismissed within 10 seconds, the system treats it as a real fall and notifies emergency contacts.

7. **Object Detection:** Turns the background green and scans for markers **84**, **85**, and **86**. Distant objects are outlined in **blue**, medium-range in **orange**, and close/dangerous objects in **red**, triggering an alert. The object’s position (left, front, right) is displayed.

8. **Anti-Theft Mode:** Allows you to select which item(s) to protect (phone = marker **88**, keys = marker **89**). Once selected, the button turns orange while searching for the marker. If not found in time, an error is shown. If found, the border turns green. If the item disappears briefly, an alarm is triggered after a short delay, and the missing item is displayed.

   > Note: Fall detection, object detection, and anti-theft mode can be deactivated by clicking the active button again (button border turns green when active).

9. **Camera Switch:** Cycles through different camera views.

## Source Code Credits 💻

- Based on the CPSC 581 proxemics demo ["581-basic-distance"](https://glitch.com/edit/#!/581-basic-distance?path=index.html%3A3%3A8)
- Uses the [js-aruco2 library](https://damianofalcioni.github.io/js-aruco2/)
- Markers created using: [Marker Creator Tool](https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html?dictionary=ARUCO_MIP_36h12)

## Image Credits 📸

1. [https://pixabay.com/sound-effects/level-up-191997/](https://pixabay.com/sound-effects/level-up-191997/)
2. [https://pixabay.com/sound-effects/security-alarm-63578/](https://pixabay.com/sound-effects/security-alarm-63578/)
3. [https://pixabay.com/sound-effects/alert-102266/](https://pixabay.com/sound-effects/alert-102266/)
4. [https://pixabay.com/sound-effects/public-domain-beep-sound-100267/](https://pixabay.com/sound-effects/public-domain-beep-sound-100267/)
5. [https://pixabay.com/vectors/camera-photo-portrait-1710849/](https://pixabay.com/vectors/camera-photo-portrait-1710849/)
6. [https://pixabay.com/vectors/hillslope-falling-man-declivity-99173/](https://pixabay.com/vectors/hillslope-falling-man-declivity-99173/)
7. [https://pixabay.com/vectors/sleeping-bed-sleep-rest-sign-99119/](https://pixabay.com/vectors/sleeping-bed-sleep-rest-sign-99119/)
8. [https://pixabay.com/vectors/rock-climbing-obstacle-pictogram-307236/](https://pixabay.com/vectors/rock-climbing-obstacle-pictogram-307236/)
9. [https://pixabay.com/sound-effects/button-pressed-38129/](https://pixabay.com/sound-effects/button-pressed-38129/)
10. [https://512pixels.net/projects/default-mac-wallpapers-in-5k/](https://512pixels.net/projects/default-mac-wallpapers-in-5k/)
11. [https://pixabay.com/vectors/warning-attention-exclamation-mark-98813/](https://pixabay.com/vectors/warning-attention-exclamation-mark-98813/)

## Audio Credits 🎶

1. [https://soundcloud.com/nettson/nettson-xoxo-off](https://soundcloud.com/nettson/nettson-xoxo-off)
