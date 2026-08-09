from fastapi import APIRouter

router = APIRouter(prefix="/payments", tags=["Pagamentos"])


@router.get("/methods")
async def get_payment_methods():
    return [
        {
            "id": "mpesa",
            "name": "M-Pesa",
            "icon": "mpesa",
            "color": "#FF0000",
            "enabled": True,
            "confirmation_name": "Vodacom M-Pesa",
            "instructions": [
                "1. Aceda ao menu M-Pesa no seu telefone (*100#)",
                "2. Selecione 'Pagamentos'",
                "3. Selecione 'Pagar Serviços'",
                "4. Selecione 'KaregaAki'",
                "5. Insira a referência recebida",
                "6. Insira o valor exato",
                "7. Confirme com o seu PIN M-Pesa",
            ],
            "reference_format": "#CRE-YYYYMMDD-XXX",
            "note": "Guarde o comprovativo SMS. A confirmação é automática."
        },
        {
            "id": "emola",
            "name": "e-Mola",
            "icon": "emola",
            "color": "#FF6600",
            "enabled": True,
            "confirmation_name": "Movitel e-Mola",
            "instructions": [
                "1. Aceda ao menu e-Mola no seu telefone (*123#)",
                "2. Selecione 'Pagamentos'",
                "3. Selecione 'Comércio Digital'",
                "4. Selecione 'KaregaAki'",
                "5. Insira a referência recebida",
                "6. Insira o valor exato",
                "7. Confirme com o seu PIN e-Mola",
            ],
            "reference_format": "#CRE-YYYYMMDD-XXX",
            "note": "Guarde o comprovativo SMS. A confirmação pode demorar até 2 minutos."
        },
        {
            "id": "mcash",
            "name": "mKesh",
            "icon": "mcash",
            "color": "#0066FF",
            "enabled": False,
            "confirmation_name": "Tmcel mKesh",
            "instructions": [
                "1. Aceda ao menu mKesh no seu telefone",
                "2. Selecione 'Pagamentos'",
                "3. Selecione 'Serviços'",
                "4. Selecione 'KaregaAki'",
                "5. Insira a referência recebida",
                "6. Insira o valor exato",
                "7. Confirme com o seu PIN mKesh",
            ],
            "reference_format": "#CRE-YYYYMMDD-XXX",
            "note": "Brevemente disponível."
        },
        {
            "id": "mpesa_direct",
            "name": "M-Pesa (Envio Direto)",
            "icon": "mpesa",
            "color": "#FF0000",
            "enabled": True,
            "confirmation_name": "KaregaAki Lda",
            "number": "84XXXXXXX",
            "instructions": [
                "1. Aceda ao menu M-Pesa (*100#)",
                "2. Selecione 'Enviar Dinheiro'",
                "3. Insira o número: 84XXXXXXX",
                "4. Insira o valor exato",
                "5. Na descrição, insira a referência recebida",
                "6. Confirme com o seu PIN M-Pesa",
            ],
            "reference_format": "#CRE-YYYYMMDD-XXX",
            "note": "IMPORTANTE: A referência DEVE ser colocada na descrição do envio. Sem ela, o pagamento não será identificado."
        },
        {
            "id": "emola_direct",
            "name": "e-Mola (Envio Direto)",
            "icon": "emola",
            "color": "#FF6600",
            "enabled": True,
            "confirmation_name": "KaregaAki Lda",
            "number": "86XXXXXXX",
            "instructions": [
                "1. Aceda ao menu e-Mola (*123#)",
                "2. Selecione 'Enviar Dinheiro'",
                "3. Insira o número: 86XXXXXXX",
                "4. Insira o valor exato",
                "5. Na descrição, insira a referência recebida",
                "6. Confirme com o seu PIN e-Mola",
            ],
            "reference_format": "#CRE-YYYYMMDD-XXX",
            "note": "IMPORTANTE: A referência DEVE ser colocada na descrição do envio. Sem ela, o pagamento não será identificado."
        },
    ]