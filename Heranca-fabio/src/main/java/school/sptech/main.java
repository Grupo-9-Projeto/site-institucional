package school.sptech;

public class main {
    public static void main(String[] args) {
        pessoa pesssoa = new pessoa("fabio", "07702522143","11982989017",
                "rua 3");
        pessoa aluno = new aluno("CCO", "07702522143","11982989017",
                "rua 1", "cco", new double[]{10});
        professor Professor = new professor("julia", "07702522143","11982989017",
                "rua 2", "cco", 1000.0);

        System.out.println("0 erros");

    }
}
