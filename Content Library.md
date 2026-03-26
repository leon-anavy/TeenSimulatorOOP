# **TeenSim Content Library: Attributes & Methods Mapping**

This document provides the developer with the specific mapping between Java code elements and the visual simulation assets.

## **1\. Attributes (Fields) \- "The Teenager's State"**

Every private field defined in Teenager.java must have a visual representation.

| Attribute Name | Java Type | Initial Value | Visual Representation (Simulation) |
| :---- | :---- | :---- | :---- |
| energy | int | 100 | A vertical green battery bar on the UI overlay. |
| happiness | int | 80 | The avatar's facial expression (changes based on value ranges). |
| gpa | double | 90.0 | A digital display on a "Report Card" asset in the room. |
| phoneBattery | int | 50 | A phone screen icon held by the avatar. |
| isHungry | boolean | false | A "Stomach Growl" animation or a thought bubble with food. |

## **2\. Methods (Behaviors) \- "The Life Logic"**

Methods manipulate the attributes and trigger specific animations.

| Method Name | Logic Logic (Internal) | Visual Animation Trigger |
| :---- | :---- | :---- |
| study() | energy \-= 15; gpa \+= 2.0; | Avatar sits at desk, books appear, light turns on. |
| sleep() | energy \= 100; happiness \+= 5; | Room darkens, "Zzz" icons appear above bed. |
| eat() | isHungry \= false; energy \+= 20; | Avatar consumes a pizza/apple; energy bar pulses. |
| playGames() | happiness \+= 25; energy \-= 20; | Controller appears in hands, screen glow on face. |
| talkToFriends() | happiness \+= 10; phoneBattery \-= 10; | Phone screen lights up, chat bubble icons. |

## **3\. Visual Assets & Themes**

* **Blueprint Mode:** Clean, blue-grid background. Labels with lines pointing to the avatar's body parts (e.g., "energy" points to the heart/battery).  
* **Simulation Mode:** A vibrant teenage bedroom with interactive "hotspots" that glow when a method is called in Main.java.