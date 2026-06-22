const crypto = require("crypto");

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function generateIdentity(name) {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" }
  });

  return { name, publicKey, privateKey };
}

function signPayload(privateKey, payload) {
  return crypto.sign("sha256", Buffer.from(canonicalJson(payload)), privateKey).toString("base64");
}

function verifyPayload(publicKey, payload, signature) {
  return crypto.verify(
    "sha256",
    Buffer.from(canonicalJson(payload)),
    publicKey,
    Buffer.from(signature, "base64")
  );
}

class Block {
  constructor({ index, timestamp, processamentos, previousHash, publicKey, assinatura = "", nonce = 0 }) {
    this.index = index;
    this.timestamp = timestamp;
    this.processamentos = processamentos;
    this.previousHash = previousHash;
    this.publicKey = publicKey;
    this.assinatura = assinatura;
    this.nonce = nonce;
    this.hash = "";
  }

  signedPayload() {
    return {
      index: this.index,
      timestamp: this.timestamp,
      processamentos: this.processamentos,
      previousHash: this.previousHash
    };
  }

  hashPayload() {
    return {
      ...this.signedPayload(),
      publicKey: this.publicKey,
      assinatura: this.assinatura,
      nonce: this.nonce
    };
  }

  calculateHash() {
    return sha256(canonicalJson(this.hashPayload()));
  }
}

class Blockchain {
  constructor({ difficulty = 3, owner }) {
    this.difficulty = difficulty;
    this.chain = [this.createGenesisBlock(owner)];
  }

  createGenesisBlock(owner) {
    const block = new Block({
      index: 0,
      timestamp: new Date().toISOString(),
      processamentos: [
        {
          etapa: "genesis",
          descricao: "Bloco inicial da cadeia",
          status: "OK"
        }
      ],
      previousHash: "0",
      publicKey: owner.publicKey
    });

    block.assinatura = signPayload(owner.privateKey, block.signedPayload());
    return this.mineBlock(block);
  }

  latestBlock() {
    return this.chain[this.chain.length - 1];
  }

  mineBlock(block) {
    const prefix = "0".repeat(this.difficulty);

    while (!block.calculateHash().startsWith(prefix)) {
      block.nonce += 1;
    }

    block.hash = block.calculateHash();
    return block;
  }

  addProcessingSeries(processamentos, identity) {
    const block = new Block({
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      processamentos,
      previousHash: this.latestBlock().hash,
      publicKey: identity.publicKey
    });

    block.assinatura = signPayload(identity.privateKey, block.signedPayload());
    this.chain.push(this.mineBlock(block));
    return block;
  }

  validate() {
    const errors = [];
    const prefix = "0".repeat(this.difficulty);

    for (let i = 0; i < this.chain.length; i += 1) {
      const current = this.chain[i];

      if (current.hash !== current.calculateHash()) {
        errors.push(`Bloco ${current.index}: hash armazenado nao confere com o conteudo.`);
      }

      if (!current.hash.startsWith(prefix)) {
        errors.push(`Bloco ${current.index}: prova de trabalho invalida.`);
      }

      if (!verifyPayload(current.publicKey, current.signedPayload(), current.assinatura)) {
        errors.push(`Bloco ${current.index}: assinatura digital invalida.`);
      }

      if (i === 0 && current.previousHash !== "0") {
        errors.push("Bloco genesis: hash anterior deve ser 0.");
      }

      if (i > 0 && current.previousHash !== this.chain[i - 1].hash) {
        errors.push(`Bloco ${current.index}: encadeamento com bloco anterior foi quebrado.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

function printBlock(block) {
  console.log(JSON.stringify({
    index: block.index,
    timestamp: block.timestamp,
    processamentos: block.processamentos,
    previousHash: block.previousHash,
    nonce: block.nonce,
    hash: block.hash,
    assinatura: `${block.assinatura.slice(0, 48)}...`
  }, null, 2));
}

function demo() {
  const pietra = generateIdentity("Pietra Caracco Ruiz");
  const sistemaAuditoria = generateIdentity("Sistema de Auditoria");

  const blockchain = new Blockchain({ difficulty: 3, owner: pietra });

  blockchain.addProcessingSeries([
    {
      etapa: "1",
      descricao: "Recebimento do lote de documentos academicos",
      status: "OK",
      operador: "Pietra Caracco Ruiz"
    },
    {
      etapa: "2",
      descricao: "Validacao de formato e campos obrigatorios",
      status: "OK",
      operador: "Pietra Caracco Ruiz"
    }
  ], pietra);

  blockchain.addProcessingSeries([
    {
      etapa: "3",
      descricao: "Calculo do resumo criptografico dos arquivos processados",
      status: "OK",
      operador: "Sistema de Auditoria"
    },
    {
      etapa: "4",
      descricao: "Registro final para trilha de auditoria",
      status: "OK",
      operador: "Sistema de Auditoria"
    }
  ], sistemaAuditoria);

  console.log("=== Blockchain gerada ===");
  blockchain.chain.forEach(printBlock);

  const validation = blockchain.validate();
  console.log("\nBlockchain valida?", validation.valid ? "SIM" : "NAO");

  console.log("\n=== Simulacao de adulteracao ===");
  blockchain.chain[1].processamentos[0].status = "ALTERADO";
  const afterTamper = blockchain.validate();
  console.log("Blockchain valida apos alterar um registro?", afterTamper.valid ? "SIM" : "NAO");
  console.log("Erros encontrados:");
  afterTamper.errors.forEach((error) => console.log(`- ${error}`));
}

if (require.main === module) {
  demo();
}

module.exports = {
  Block,
  Blockchain,
  canonicalJson,
  generateIdentity,
  sha256,
  signPayload,
  verifyPayload
};
