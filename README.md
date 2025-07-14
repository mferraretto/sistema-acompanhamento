# Sistema de Acompanhamento de Anúncios

Este projeto utiliza Firebase/Firestore para armazenar dados de anúncios e pedidos.

## Importação de Planilhas

Existem dois módulos de importação de planilhas:

- **Shopee** (`importShopee.js`) – importa anúncios da Shopee.
- **Pedidos** (`importPedidos.js`) – importa planilhas de pedidos.

### Colunas obrigatórias para pedidos

A planilha de pedidos deve conter as seguintes colunas (nomes equivalentes são aceitos):

| Campo salvo | Possíveis cabeçalhos na planilha |
|-------------|----------------------------------|
| `order_id`  | `order_id`, `Order ID`, `ID` |
| `buyer`     | `buyer`, `Buyer`, `Comprador` |
| `quantity`  | `quantity`, `qty`, `Quantidade` |
| `price`     | `price`, `unit price`, `Preço` |
| `total`     | `total`, `Total`, `Valor Total` |
| `status`    | `status`, `Status` |

Outras colunas da planilha são ignoradas.

Para importar, selecione o arquivo `.xlsx` correspondente e clique em **Salvar Pedidos**.
