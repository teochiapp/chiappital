// components/Trades/CloseTradeModal.js - Modal para cerrar trades
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  font-family: 'Unbounded', sans-serif;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  font-family: 'Unbounded', sans-serif;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Unbounded', sans-serif;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Unbounded', sans-serif;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #95a5a6;
    font-style: italic;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Unbounded', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;

  &.primary {
    background: #27ae60;
    color: white;

    &:hover {
      background: #229954;
    }

    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: transparent;
    color: #7f8c8d;
    border: 2px solid #e1e8ed;

    &:hover {
      background: #f8f9fa;
    }
  }
`;

const TradeInfo = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-family: 'Unbounded', sans-serif;
`;

const ResultDisplay = styled.div`
  background: ${props => props.$isPositive ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$isPositive ? '#155724' : '#721c24'};
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-family: 'Unbounded', sans-serif;
  font-weight: 600;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-family: 'Unbounded', sans-serif;
  font-weight: 500;
`;

const CloseTradeModal = ({ isOpen, onClose, trade, onTradeClosed }) => {
  const [exitPrice, setExitPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para adaptar estructura de Strapi
  const getTradeAttr = (trade, attr) => {
    if (!trade) return null;
    return trade.attributes ? trade.attributes[attr] : trade[attr];
  };

  // Inicializar notas existentes cuando se abre el modal
  React.useEffect(() => {
    if (isOpen && trade) {
      const existingNotes = getTradeAttr(trade, 'notes') || '';
      setNotes(existingNotes);
    }
  }, [isOpen, trade]);

  // Calcular resultado automáticamente en porcentaje
  const calculateResult = () => {
    if (!exitPrice || !getTradeAttr(trade, 'entry_price')) {
      return 0;
    }

    const entry = parseFloat(getTradeAttr(trade, 'entry_price'));
    const exit = parseFloat(exitPrice);

    let resultPercent = 0;
    if (getTradeAttr(trade, 'type') === 'buy') {
      // Compra: ganancia = (precio_salida - precio_entrada) / precio_entrada * 100
      resultPercent = ((exit - entry) / entry) * 100;
    } else { // sell (short)
      // Venta corta: ganancia = (precio_entrada - precio_salida) / precio_entrada * 100
      resultPercent = ((entry - exit) / entry) * 100;
    }

    return resultPercent.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!exitPrice) {
      setError('Por favor ingresa el precio de salida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = calculateResult();
      await onTradeClosed(trade.id, parseFloat(exitPrice), parseFloat(result), notes.trim());
      // Solo cerrar el modal si no hubo errores
      onClose();
    } catch (err) {
      console.error('Error al cerrar trade:', err);
      // Mostrar mensaje de error al usuario
      setError(err.message || 'Error al cerrar el trade. Por favor, intenta nuevamente.');
      // No cerrar el modal para que el usuario pueda ver el error
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setExitPrice('');
    setNotes('');
    setError('');
    onClose();
  };

  if (!trade) return null;

  const result = calculateResult();
  const isPositive = parseFloat(result) >= 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle>🔒 Cerrar Trade</ModalTitle>
            
            <TradeInfo>
              <strong>{getTradeAttr(trade, 'symbol')}</strong> - {getTradeAttr(trade, 'type') === 'buy' ? 'Compra' : 'Venta'}<br/>
              Precio de Entrada: ${getTradeAttr(trade, 'entry_price')}<br/>
              {getTradeAttr(trade, 'portfolio_percentage') && `% Cartera: ${getTradeAttr(trade, 'portfolio_percentage')}%`}
            </TradeInfo>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="exitPrice">Precio de Salida *</Label>
                <Input
                  type="number"
                  id="exitPrice"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </FormGroup>

              {exitPrice && (
                <ResultDisplay $isPositive={isPositive}>
                  Resultado: {result}%
                </ResultDisplay>
              )}

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" className="primary" disabled={loading || !exitPrice}>
                  {loading ? 'Cerrando...' : 'Cerrar Trade'}
                </Button>
              </ButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default CloseTradeModal;
