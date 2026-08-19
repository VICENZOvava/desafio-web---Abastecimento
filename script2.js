let splash = document.getElementById("splash");
let home = document.getElementById("home");

let enterBtn = document.getElementById("enterBtn");
let themeToggle = document.getElementById("themeToggle");

let grafico;


enterBtn.addEventListener("click", function () {

    splash.classList.add("hidden");
    home.classList.remove("hidden");
    recuperarCadastro();

});


themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.innerText = "TEMA CLARO";
        localStorage.setItem("tema", "dark");

    } else {
        themeToggle.innerText = "TEMA ESCURO";
        localStorage.setItem("tema", "light");
    }

});


if (localStorage.getItem("tema") === "dark") {

    document.body.classList.add("dark");
    themeToggle.innerText = "TEMA CLARO";

}

function cadastrar() {

    let data = document.getElementById("data").value;
    let combustivel = document.getElementById("combustivel").value;

    let litros = parseFloat(
        document.getElementById("litros").value
    );

    let valor_pago = parseFloat(
        document.getElementById("valor_pago").value
    );

    let quilometragem = parseFloat(
        document.getElementById("quilometragem").value
    );

    if (
        data === "" ||
        combustivel === "" ||
        isNaN(litros) ||
        isNaN(valor_pago) ||
        isNaN(quilometragem)
    ) {

        alert("Preencha todos os campos.");

        return;
    }


    if (litros <= 0 || valor_pago <= 0 || quilometragem < 0) {

        alert("Digite valores válidos.");

        return;
    }


    let abastecimento = {

        data: data,
        combustivel: combustivel,
        litros: litros,
        valor_pago: valor_pago,
        quilometragem: quilometragem

    };


    // Recupera lista
    let lista = localStorage.getItem("abastecimentos");


    if (lista == null) {
        lista = [];

    } else {
        lista = JSON.parse(lista);

    }

    lista.push(abastecimento);

    lista.sort(function (a, b) {
        return a.quilometragem - b.quilometragem;
    });


    localStorage.setItem(
        "abastecimentos",
        JSON.stringify(lista)
    );

    document.getElementById("data").value = "";
    document.getElementById("combustivel").value = "";
    document.getElementById("litros").value = "";
    document.getElementById("valor_pago").value = "";
    document.getElementById("quilometragem").value = "";

    recuperarCadastro();
}


function limparCadastro() {

    let confirmar = confirm(
        "Deseja realmente apagar todos os abastecimentos?"
    );

    if (!confirmar) {
        return;
    }

    localStorage.removeItem("abastecimentos");

    recuperarCadastro();
}


function recuperarCadastro() {
    let lista = localStorage.getItem("abastecimentos");

    if (lista == null) {
        lista = [];
    } else {
        lista = JSON.parse(lista);
    }


    let tbody = document.getElementById(
        "tabelaAbastecimentos"
    );

    tbody.innerHTML = "";

    if (lista.length === 0) {

        let linha = document.createElement("tr");

        linha.innerHTML = `
            <td colspan="6">
                Nenhum abastecimento cadastrado.
            </td>
        `;
        tbody.appendChild(linha);

    }

    lista.forEach(function (abastecimento, indice) {

        let linha = document.createElement("tr");


        let tdData = document.createElement("td");
        let tdCombustivel = document.createElement("td");
        let tdLitros = document.createElement("td");
        let tdValor = document.createElement("td");
        let tdKm = document.createElement("td");
        let tdExclui = document.createElement("td");

        let btExclui = document.createElement("button");
        
        let dataFormatada = abastecimento.data;

        if (abastecimento.data) {
            let partes = abastecimento.data.split("-");
            if (partes.length === 3) {
                dataFormatada =
                    partes[2] + "/" +
                    partes[1] + "/" +
                    partes[0];
            }

        }

        tdData.innerText = dataFormatada;

        tdCombustivel.innerText =
            abastecimento.combustivel;

        tdLitros.innerText =
            Number(abastecimento.litros).toFixed(2);

        tdValor.innerText =
            "R$ " +
            Number(abastecimento.valor_pago)
                .toFixed(2)
                .replace(".", ",");

        tdKm.innerText =
            Number(abastecimento.quilometragem)
                .toFixed(1);

        btExclui.innerText = "Excluir";

        btExclui.classList.add("btn-excluir");


        btExclui.addEventListener(
            "click",
            function () {

                excluirAbastecimento(indice);

            }
        );


        tdExclui.appendChild(btExclui);


        linha.appendChild(tdData);
        linha.appendChild(tdCombustivel);
        linha.appendChild(tdLitros);
        linha.appendChild(tdValor);
        linha.appendChild(tdKm);
        linha.appendChild(tdExclui);


        tbody.appendChild(linha);

    });


    calcularMedias(lista);

    criarGrafico(lista);

}

function excluirAbastecimento(indice) {

    let lista = localStorage.getItem("abastecimentos");

    if (lista == null) {
        return;
    }

    lista = JSON.parse(lista);

    lista.splice(indice, 1);


    localStorage.setItem(
        "abastecimentos",
        JSON.stringify(lista)
    );


    recuperarCadastro();

}


function calcularMedias(lista) {

    let precoMedioElement =
        document.getElementById("precoMedio");

    let consumoMedioElement =
        document.getElementById("consumoMedio");


    if (lista.length === 0) {

        precoMedioElement.innerText = "0,00";

        consumoMedioElement.innerText = "0,00";

        return;

    }


    let totalLitros = 0;
    let totalPago = 0;


    lista.forEach(function (abastecimento) {

        totalLitros +=
            Number(abastecimento.litros);

        totalPago +=
            Number(abastecimento.valor_pago);

    });


    let precoMedio =
        totalPago / totalLitros;


    precoMedioElement.innerText =
        precoMedio.toFixed(2).replace(".", ",");


    if (lista.length < 2) {

        consumoMedioElement.innerText = "0,00";

        return;

    }


    let consumos = [];


    for (let i = 1; i < lista.length; i++) {

        let abastecimentoAtual = lista[i];

        let abastecimentoAnterior =
            lista[i - 1];


        let distancia =
            Number(abastecimentoAtual.quilometragem) -
            Number(abastecimentoAnterior.quilometragem);


        let litros =
            Number(abastecimentoAtual.litros);


        if (distancia > 0 && litros > 0) {

            let consumo =
                distancia / litros;

            consumos.push(consumo);

        }

    }


    if (consumos.length === 0) {

        consumoMedioElement.innerText = "0,00";

        return;

    }


    let somaConsumos = consumos.reduce(
        function (total, consumo) {

            return total + consumo;

        },
        0
    );


    let consumoMedio =
        somaConsumos / consumos.length;


    consumoMedioElement.innerText =
        consumoMedio.toFixed(2).replace(".", ",");

}


function criarGrafico(lista) {

    let canvas =
        document.getElementById(
            "graficoAbastecimentos"
        );


    if (grafico) {

        grafico.destroy();

    }


    if (lista.length === 0) {

        return;

    }


    let labels = [];
    let valores = [];
    let litros = [];


    lista.forEach(function (abastecimento) {

        labels.push(
            abastecimento.data
        );

        valores.push(
            Number(abastecimento.valor_pago)
        );

        litros.push(
            Number(abastecimento.litros)
        );

    });


    grafico = new Chart(canvas, {
        type: "bar",

        data: {

            labels: labels,
            datasets: [

                {
                    label: "Valor pago (R$)",
                    data: valores,
                    borderWidth: 1
                },

                {
                    label: "Litros",
                    data: litros,
                    borderWidth: 1
                }
            ]
        }
    });
}