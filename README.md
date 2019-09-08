# Comunas Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Gitter](https://badges.gitter.im/comunasbrasil/community.svg)](https://gitter.im/comunasbrasil/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

### Projeto

Esse projeto tem como objetivo ser a API para a plataforma comunitária Comunas. Quer tem como objetivo a promoção de comunidades mais ativas e próximas das soluções dos seus problemas.  

### Como Começar

Primeiro é necessário inicializar um single-node Docker Swarm no seu computador como rodando o OpenFaaS. 
* Você encontra todos os passos nesse tutorial [aqui](https://github.com/openfaas/workshop/blob/master/lab1a.md).

Agora precisamos criar as dependencias especificas do nosso projeto
* Para isso somente é necessário executar o script de inicialização:
```sh
$ ./init.sh
```

Depois disso é so subir as nossas funções e já pode começar!

### Arquitetura

Esse projeto utiliza da arquitetura serveless atraves do [OpenFaas](). Qualquer dúvida, é fácil encontrar uma resposta na sua documentação [aqui](https://docs.openfaas.com/).
