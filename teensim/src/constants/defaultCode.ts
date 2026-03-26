export const FULL_TEENAGER_CODE = `public class Teenager {
    private int energy;
    private int happiness;
    private double gpa;
    private int phoneBattery;
    private boolean isHungry;

    public Teenager() {
        energy = 100;
        happiness = 80;
        gpa = 90.0;
        phoneBattery = 50;
        isHungry = false;
    }

    public void study() {
        energy -= 15;
        gpa += 2.0;
    }

    public void sleep() {
        energy = 100;
        happiness += 5;
    }

    public void eat() {
        isHungry = false;
        energy += 20;
    }

    public void playGames() {
        happiness += 25;
        energy -= 20;
    }

    public void talkToFriends() {
        happiness += 10;
        phoneBattery -= 10;
    }

    public String toString() {
        return "Teenager [energy=" + energy + ", happiness=" + happiness + "]";
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
