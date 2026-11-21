package school.sptech;

public class professor extends pessoa {
    private String cursos;
    private double salario;

    public professor(String nome, String cpf, String telefone, String endereco, String cursos, double salario) {
        super(nome, cpf, telefone, endereco);
        this.cursos = cursos;
        this.salario = salario;
    }

    public String getCursos() {
        return cursos;
    }

    public void setCursos(String cursos) {
        this.cursos = cursos;
    }

    public double getSalario() {
        return salario;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }

    public professor(String nome, String cpf, String telefone, String endereco) {
        super(nome, cpf, telefone, endereco);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    @Override
    public String toString() {
        return super.toString();
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
    }
}
