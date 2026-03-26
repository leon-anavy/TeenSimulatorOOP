# **Technical Specification: "TeenSim" \- Java OOP Learning Sandbox**

## **1\. Project Overview**

"TeenSim" is an interactive, web-based pedagogical tool designed to teach 10th-grade students the fundamentals of Object-Oriented Programming (OOP) in Java. The application uses a "Teenager Simulator" metaphor to allow students to construct, instantiate, and manipulate objects in a self-paced, constructive environment.

## **2\. Core Architecture & Engine**

The application is a Single Page Application (SPA). The "Engine" must bridge the gap between Java-like syntax input and a reactive visual state across multiple files.

### **2.1. Multi-File Pseudo-Java Interpreter**

The engine handles two distinct execution contexts:

* **Teenager.java (Class Definition):** Parsed for structure. It defines the "Template" (Fields, Constructor signature, and Method logic).  
* **Main.java (Client Code):** Parsed for execution. It handles object instantiation (new) and method calls.

**Key Logic:** The interpreter must ensure that Main.java is aware of the symbols defined in Teenager.java. If a field is private in the class file, the interpreter must throw a pedagogical error if the student tries to access it directly in the Main file.

### **2.2. Contextual Visualizer Engine**

The visual output changes based on the active file tab:

* **Blueprint View (Active when Teenager.java is selected):** Shows a "Technical X-Ray" of the teenager, highlighting where fields map to body parts or status bars.  
* **Simulation View (Active when Main.java is selected):** Shows the "Live World" where objects interact, move, and change state in real-time.

## **3\. UI/UX Design**

The interface follows a **"Dual-Pane" Layout** with a **File Navigation System**:

* **File Tabs:** Located at the top of the Left Pane, allowing quick switching between Teenager.java and Main.java.  
* **Left Pane (The IDE):**  
  * Integrated Code Editor (e.g., **Monaco Editor**) with syntax highlighting.  
  * *Context-Aware Tooltips:* If the student is in Main.java, tooltips suggest available methods from Teenager.java.  
* **Right Pane (The Simulation/Blueprint):**  
  * **The Visual Workspace:** Switches between the "Blueprint" (static structure) and the "World" (runtime simulation).  
  * **The Object Inspector:** Displays a list of all instantiated objects (e.g., teen1, teen2) and their current private data.  
  * **The Console:** Shared output for both files.

## **4\. Logical Progression (Module System)**

### **Stage 1: The Blueprint (Teenager.java focus)**

* **Goal:** Define fields.  
* **Visual:** The "Blueprint View" updates as fields are added.

### **Stage 2: The Birth (Main.java focus)**

* **Goal:** Introduction of the Main file and the new keyword.  
* **Logic:** Writing Teenager t1 \= new Teenager(); in Main.java triggers an animation of a new avatar appearing in the "World View".

### **Stage 3: Interaction (Main.java focus)**

* **Goal:** Calling methods.  
* **Logic:** Calling t1.study() in the code triggers the "Study" animation in the visualizer.

### **Stage 4: Encapsulation (Cross-file focus)**

* **Goal:** Understanding access modifiers.  
* **Logic:** Forcing students to use Getters/Setters in Main.java because direct field access is blocked by the private keyword in Teenager.java.

## **5\. Technical Requirements**

* **Frontend:** React.js / TypeScript.  
* **State Management:** Global state (Zustand/Redux) to sync the Class definition with the Main execution environment.  
* **Pedagogical Error Interceptor:** Provides targeted feedback based on file context (e.g., "You are trying to define a method in the Main file; move it to Teenager.java").

## **6\. API & Data Flow**

1. **Sync:** Changes in Teenager.java update the ClassSchema.  
2. **Validation:** Main.java is validated against the current ClassSchema.  
3. **Instantiation:** new keywords in Main.java create instances in the VirtualMemory.  
4. **Reflection:** The Simulation View renders all instances stored in VirtualMemory.