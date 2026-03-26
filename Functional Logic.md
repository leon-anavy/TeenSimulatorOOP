# **TeenSim Functional Logic & State Management**

Technical requirements for the developer regarding the engine and cross-file interaction.

## **1\. The Cross-File Compiler Engine**

The engine must perform a "Virtual Linking" between the two editor tabs.

* **Symbol Table:** Maintain a real-time list of all private fields and public methods defined in Teenager.java.  
* **Main File Validation:** Intercept calls in Main.java (e.g., t1.study()).  
  * Verify if study() exists in the Teenager Symbol Table.  
  * Prevent illegal access: If the student writes t1.energy \= 5, flag it as an "Encapsulation Violation".

## **2\. Runtime Simulation State**

The state of the teenager is persistent across code edits.

* **Instance Registry:** A JavaScript object that holds all current instances created in Main.java.  
  instances: \[  
    { id: "t1", type: "Teenager", state: { energy: 90, happiness: 85, gpa: 92.5 } }  
  \]

* **Action Dispatcher:** When t1.study() is executed in the pseudo-interpreter, it must dispatch an action to update the instances array.

## **3\. Step-by-Step Transition Logic**

### **Transition Stage 1 \-\> 2**

* **Trigger:** Successful definition of at least 2 fields with private modifier.  
* **UI Change:** Unlock the Main.java tab. Add a "Blinking" indicator on the tab.

### **Transition Stage 2 \-\> 3**

* **Trigger:** Execution of new Teenager() in Main.  
* **UI Change:** Trigger "Birth" animation (Avatar fades in from white). Open the "Simulation View".

### **Transition Stage 3 \-\> 4**

* **Trigger:** At least one method called from Main that successfully changes a field value.  
* **UI Change:** Introduce the "Console" output window.

## **4\. Debugging Tools (The Object Inspector)**

* The application must show a JSON-like tree view of the objects in memory.  
* This view updates **LIVE** as methods are called.  
* Pedagogical Goal: Show that t1 and t2 are two different objects with separate states, even though they share the same class code.