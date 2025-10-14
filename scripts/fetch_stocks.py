import yfinance as yf
import json
from datetime import datetime, timezone
import os

TICKERS = [
    'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'NVDA', 'META', 'TSLA', 
    'BRK-B', 'JPM', 'V', 'MA', 'JNJ', 'UNH', 'XOM', 'WMT', 
    'PG', 'DIS', 'NFLX', 'TSM', 'BAC'
]

def fetch_stock_data():
    stocks_data = []
    
    for ticker in TICKERS:
        try:
            # Fetch ticker data
            stock = yf.Ticker(ticker)
            hist = stock.history(period='2d')
            
            if len(hist) >= 2:
                current_price = hist['Close'].iloc[-1]
                previous_close = hist['Close'].iloc[-2]
                change = current_price - previous_close
                change_percent = (change / previous_close) * 100
                
                stocks_data.append({
                    'symbol': ticker,
                    'price': round(float(current_price), 2),
                    'change': round(float(change), 2),
                    'change_percent': round(float(change_percent), 2),
                    'previous_close': round(float(previous_close), 2)
                })
                print(f"✓ {ticker}: ${current_price:.2f}")
            else:
                print(f"✗ {ticker}: Insufficient data")
        except Exception as e:
            print(f"✗ {ticker}: {str(e)}")
    
    # Create data directory if it doesn't exist
    os.makedirs('assets/data', exist_ok=True)
    
    # Save to JSON file
    output = {
        'last_updated': datetime.now(timezone.utc).isoformat(),
        'stocks': stocks_data
    }
    
    with open('assets/data/stocks.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✓ Updated {len(stocks_data)} stocks")

if __name__ == '__main__':
    fetch_stock_data()
