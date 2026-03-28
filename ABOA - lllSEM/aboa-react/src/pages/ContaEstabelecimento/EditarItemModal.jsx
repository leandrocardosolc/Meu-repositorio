import React, { useState } from "react";
import styles from "./editaritem.module.css";

export default function EditarItemModal({
  formItem,
  setFormItem,
  salvarItem,
  fechar,
  editando,
}) {
  // preview visual da imagem
  const [preview, setPreview] = useState(
    formItem.foto
      ? formItem.foto instanceof File
        ? URL.createObjectURL(formItem.foto)
        : formItem.fotoUrl
      : null
  );

  // -------------------------------------------
  // FOTO
  // -------------------------------------------
  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Envie apenas imagens.");
      return;
    }

    // preview visual
    setPreview(URL.createObjectURL(file));

    // salva o FILE real
    setFormItem((prev) => ({ ...prev, foto: file }));
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{editando ? "Editar Item" : "Novo Item"}</h2>

        {/* FOTO DO ITEM */}
        <div className={styles.uploadArea}>
          {!preview ? (
            <>
              <p>Envie a foto do item</p>
              <span>Clique para selecionar ou arraste</span>

              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </>
          ) : (
            <>
              <img src={preview} alt="" className={styles.previewImg} />
              <button
                type="button"
                className={styles.removeImg}
                onClick={() => {
                  setPreview(null);
                  setFormItem((prev) => ({ ...prev, foto: null }));
                }}
              >
                Remover foto
              </button>
            </>
          )}
        </div>

        {/* CAMPOS BÁSICOS */}
        <label>Nome</label>
        <input
          type="text"
          value={formItem.nome}
          onChange={(e) =>
            setFormItem((prev) => ({ ...prev, nome: e.target.value }))
          }
          placeholder="Ex: X-Burger Artesanal"
        />

        <label>Descrição</label>
        <textarea
          value={formItem.descricao}
          onChange={(e) =>
            setFormItem((prev) => ({ ...prev, descricao: e.target.value }))
          }
          placeholder="Descreva o item..."
        />

        <label>Preço (R$)</label>
        <input
          type="number"
          step="0.01"
          value={formItem.preco}
          onChange={(e) =>
            setFormItem((prev) => ({ ...prev, preco: e.target.value }))
          }
          placeholder="0.00"
        />

        {/* 🔥 TIPO DO ITEM (AGORA SEMPRE VISÍVEL) */}
        <label>Tipo do Item</label>
        <select
          value={formItem.tipo || "principal"}
          onChange={(e) =>
            setFormItem((prev) => ({ ...prev, tipo: e.target.value }))
          }
          className={`${styles.select} ${styles.selectTipo}`}
        >

        
          <option value="principal">Prato Principal</option>
          <option value="acompanhamento">Acompanhamento</option>
          <option value="bebida">Bebida</option>
          <option value="sobremesa">Sobremesa</option>
        </select>

        {/* DISPONIBILIDADE */}
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={formItem.disponivel}
            onChange={(e) =>
              setFormItem((prev) => ({
                ...prev,
                disponivel: e.target.checked,
              }))
            }
          />
          Disponível para venda
        </label>

        {/* EM PROMOÇÃO */}
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={formItem.emPromocao}
            onChange={(e) =>
              setFormItem((prev) => ({
                ...prev,
                emPromocao: e.target.checked,
              }))
            }
          />
          Este item está em promoção
        </label>

        {/* CAMPOS DE PROMOÇÃO */}
        {formItem.emPromocao && (
          <div className={styles.promoBox}>
            <label>Preço promocional</label>
            <input
              type="number"
              step="0.01"
              value={formItem.precoPromocional || ""}
              onChange={(e) =>
                setFormItem((prev) => ({
                  ...prev,
                  precoPromocional: e.target.value,
                }))
              }
              placeholder="0.00"
            />

            <label>Texto da promoção</label>
            <input
              type="text"
              value={formItem.textoPromocao || ""}
              onChange={(e) =>
                setFormItem((prev) => ({
                  ...prev,
                  textoPromocao: e.target.value,
                }))
              }
              placeholder="Ex: 20% OFF — Somente hoje"
            />
          </div>
        )}

        {/* BOTÕES */}
        <div className={styles.actions}>
          <button className={styles.cancelar} onClick={fechar}>
            Cancelar
          </button>

          <button className={styles.salvar} onClick={salvarItem}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
