export const FULL_TEENAGER_CODE = `public class Teenager {
    private int energy;
    private int happiness;
    private double gpa;
    private int phoneBattery;
    private boolean isHungry;

    public Teenager() {
        this.energy = 100;
        this.happiness = 80;
        this.gpa = 90.0;
        this.phoneBattery = 50;
        this.isHungry = false;
    }

    public void study() {
        this.energy -= 15;
        this.gpa += 2.0;
    }

    public void sleep() {
        this.energy = 100;
        this.happiness += 5;
    }

    public void eat() {
        this.isHungry = false;
        this.energy += 20;
    }

    public void playGames() {
        this.happiness += 25;
        this.energy -= 20;
    }

    public void talkToFriends() {
        this.happiness += 10;
        this.phoneBattery -= 10;
    }

    public String toString() {
        return "Teenager [energy=" + this.energy + ", happiness=" + this.happiness + "]";
    }
}
`;

export const DEFAULT_TEENAGER_CODE = `public class Teenager {
    // הגדר כאן את השדות של המחלקה
    // לדוגמה: private int energy;

}
`;

export const DEFAULT_MAIN_CODE = `public class Main {
    public static void main(String[] args) {
        // כתוב את הקוד שלך כאן
        // לדוגמה: Teenager t1 = new Teenager();

    }
}
`;
