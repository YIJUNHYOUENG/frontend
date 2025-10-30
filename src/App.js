import React, { useState } from 'react';
import { Database, Search, Table, ChevronRight, CheckCircle, XCircle, Loader, Copy, Check, Download } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// 테스트 모드 활성화 (true로 설정하면 서버 없이 작동)
const TEST_MODE = false;

// 테스트용 Mock 데이터
const MOCK_DATA = {
  tables: [
    'users',
    'orders',
    'products',
    'categories',
    'order_items',
    'payments',
    'shipping_addresses',
    'reviews',
    'customers',
    'inventory'
  ],
  columns: {
    users: [
      { name: 'id', type: 'INTEGER', key: 'PRI', null: 'NO', default: 'nextval(\'users_id_seq\'::regclass)', comment: '사용자 고유 ID' },
      { name: 'username', type: 'VARCHAR(50)', key: 'UNI', null: 'NO', default: null, comment: '로그인 사용자명' },
      { name: 'email', type: 'VARCHAR(100)', key: 'UNI', null: 'NO', default: null, comment: '이메일 주소' },
      { name: 'password', type: 'VARCHAR(255)', key: '', null: 'NO', default: null, comment: '암호화된 비밀번호' },
      { name: 'full_name', type: 'VARCHAR(100)', key: '', null: 'YES', default: null, comment: '전체 이름' },
      { name: 'phone', type: 'VARCHAR(20)', key: '', null: 'YES', default: null, comment: '전화번호' },
      { name: 'created_at', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', comment: '생성 일시' },
      { name: 'updated_at', type: 'TIMESTAMP', key: '', null: 'YES', default: null, comment: '수정 일시' }
    ],
    orders: [
      { name: 'id', type: 'INTEGER', key: 'PRI', null: 'NO', default: 'nextval(\'orders_id_seq\'::regclass)', comment: '주문 고유 ID' },
      { name: 'user_id', type: 'INTEGER', key: 'MUL', null: 'NO', default: null, comment: '사용자 ID (FK)' },
      { name: 'order_number', type: 'VARCHAR(50)', key: 'UNI', null: 'NO', default: null, comment: '주문 번호' },
      { name: 'total_amount', type: 'NUMERIC(10,2)', key: '', null: 'NO', default: '0', comment: '총 주문 금액' },
      { name: 'status', type: 'VARCHAR(20)', key: '', null: 'NO', default: '\'pending\'', comment: '주문 상태 (pending, paid, shipped, delivered, cancelled)' },
      { name: 'order_date', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', comment: '주문 일시' },
      { name: 'shipped_date', type: 'TIMESTAMP', key: '', null: 'YES', default: null, comment: '배송 일시' },
      { name: 'delivery_date', type: 'TIMESTAMP', key: '', null: 'YES', default: null, comment: '배송 완료 일시' }
    ],
    products: [
      { name: 'id', type: 'INTEGER', key: 'PRI', null: 'NO', default: 'nextval(\'products_id_seq\'::regclass)', comment: '상품 고유 ID' },
      { name: 'name', type: 'VARCHAR(200)', key: '', null: 'NO', default: null, comment: '상품명' },
      { name: 'description', type: 'TEXT', key: '', null: 'YES', default: null, comment: '상품 설명' },
      { name: 'price', type: 'NUMERIC(10,2)', key: '', null: 'NO', default: null, comment: '판매 가격' },
      { name: 'category_id', type: 'INTEGER', key: 'MUL', null: 'YES', default: null, comment: '카테고리 ID (FK)' },
      { name: 'stock', type: 'INTEGER', key: '', null: 'NO', default: '0', comment: '재고 수량' },
      { name: 'sku', type: 'VARCHAR(50)', key: 'UNI', null: 'NO', default: null, comment: '상품 코드' },
      { name: 'is_active', type: 'BOOLEAN', key: '', null: 'NO', default: 'true', comment: '활성화 여부' },
      { name: 'created_at', type: 'TIMESTAMP', key: '', null: 'NO', default: 'CURRENT_TIMESTAMP', comment: '등록 일시' }
    ],
    categories: [
      { name: 'id', type: 'INTEGER', key: 'PRI', null: 'NO', default: 'nextval(\'categories_id_seq\'::regclass)', comment: '카테고리 ID' },
      { name: 'name', type: 'VARCHAR(100)', key: 'UNI', null: 'NO', default: null, comment: '카테고리명' },
      { name: 'parent_id', type: 'INTEGER', key: 'MUL', null: 'YES', default: null, comment: '상위 카테고리 ID' },
      { name: 'description', type: 'TEXT', key: '', null: 'YES', default: null, comment: '카테고리 설명' }
    ]
  },
  ddl: {
    users: `CREATE TABLE users (
  id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT users_username_key UNIQUE (username),
  CONSTRAINT users_email_key UNIQUE (email)
);

COMMENT ON COLUMN users.id IS '사용자 고유 ID';
COMMENT ON COLUMN users.username IS '로그인 사용자명';
COMMENT ON COLUMN users.email IS '이메일 주소';
COMMENT ON COLUMN users.password IS '암호화된 비밀번호';
COMMENT ON COLUMN users.full_name IS '전체 이름';
COMMENT ON COLUMN users.phone IS '전화번호';
COMMENT ON COLUMN users.created_at IS '생성 일시';
COMMENT ON COLUMN users.updated_at IS '수정 일시';`,
    orders: `CREATE TABLE orders (
  id INTEGER NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  user_id INTEGER NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  order_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  shipped_date TIMESTAMP,
  delivery_date TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT orders_order_number_key UNIQUE (order_number),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMENT ON COLUMN orders.id IS '주문 고유 ID';
COMMENT ON COLUMN orders.user_id IS '사용자 ID (FK)';
COMMENT ON COLUMN orders.order_number IS '주문 번호';
COMMENT ON COLUMN orders.total_amount IS '총 주문 금액';
COMMENT ON COLUMN orders.status IS '주문 상태 (pending, paid, shipped, delivered, cancelled)';`
  }
};

// Mock Fetch 함수
const mockFetch = async (url, options = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300)); // 네트워크 지연 시뮬레이션

  if (url.includes('/connect')) {
    return {
      json: async () => ({ success: true, message: '데이터베이스에 성공적으로 연결되었습니다. (테스트 모드)' })
    };
  }

  if (url.includes('/schema')) {
    return {
      json: async () => ({ success: true, schema: ['public', 'test_schema'] })
    };
  }

  if (url.includes('/tables') && !url.includes('/columns') && !url.includes('/ddl') && !url.includes('/dml')) {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    const search = searchParams.get('search');
    
    let tables = MOCK_DATA.tables;
    if (search) {
      tables = tables.filter(t => t.toLowerCase().includes(search.toLowerCase()));
    }
    
    return {
      json: async () => ({ success: true, tables })
    };
  }

  if (url.includes('/columns')) {
    const tableName = url.split('/tables/')[1].split('/columns')[0];
    return {
      json: async () => ({ 
        success: true, 
        columns: MOCK_DATA.columns[tableName] || []
      })
    };
  }

  if (url.includes('/ddl')) {
    const tableName = url.split('/tables/')[1].split('/ddl')[0];
    return {
      json: async () => ({ 
        success: true, 
        ddl: MOCK_DATA.ddl[tableName] || `CREATE TABLE ${tableName} (\n  id INTEGER PRIMARY KEY\n);`
      })
    };
  }

  if (url.includes('/disconnect')) {
    return {
      json: async () => ({ success: true, message: '연결이 해제되었습니다.' })
    };
  }

  return {
    json: async () => ({ success: false, message: 'Unknown endpoint' })
  };
};

export default function DatabaseTableViewer() {
  const [dbInfo, setDbInfo] = useState({
    host: 'localhost',
    port: '5432',
    database: '',
    username: '',
    password: ''
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [columnSearchTerm, setColumnSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  
  const [tables, setTables] = useState([]);
  const [tableColumns, setTableColumns] = useState({});
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);

  const [showDDL, setShowDDL] = useState(false);
  const [showDML, setShowDML] = useState(false);
  const [ddlContent, setDdlContent] = useState('');
  const [dmlContent, setDmlContent] = useState('');
  const [isLoadingDDL, setIsLoadingDDL] = useState(false);
  const [isLoadingDML, setIsLoadingDML] = useState(false);
  const [copiedDDL, setCopiedDDL] = useState(false);
  const [copiedDML, setCopiedDML] = useState(false);
  
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [dmlType, setDmlType] = useState('insert'); // insert, select, update

  React.useEffect(() => {
    if (isConnected) {
      loadTables();
    }
    // eslint-disable-next-line
  }, [searchTerm, isConnected]);

  // DB 연결
  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionMessage('');
    
    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      const response = await fetchFn(`${API_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbInfo)
      });
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setConnectionMessage(TEST_MODE ? '연결 성공! (테스트 모드)' : '연결 성공!');
        schemaInfo();
        loadTables();
      } else {
        setConnectionMessage(`연결 실패: ${data.message}`);
      }
    } catch (error) {
      setConnectionMessage(`연결 오류: ${error.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // 테이블 스키마 이름 조회(서버 자체에서 관리)
  const schemaInfo = async () => {
    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      const url = `${API_URL}/schema`;

      const response = await fetchFn(url);
      const data = await response.json();

      if (!data.success) {
        console.log('스키마 조회 실패');
      }
    } catch (error) {
      console.error('스키마 조회 오류:', error);
    }
  }

  // 테이블 목록 로드
  const loadTables = async () => {
    setIsLoadingTables(true);

    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      const url = searchTerm
        ? `${API_URL}/tables?search=${encodeURIComponent(searchTerm)}`
        : `${API_URL}/tables`;

      const response = await fetchFn(url);
      const data = await response.json();

      if (data.success) {
        setTables(data.tables);
      }
    } catch (error) {
      console.error('테이블 로드 오류:', error);
    } finally {
      setIsLoadingTables(false);
    }
  };

  // 테이블 선택 시 컬럼 정보 로드
  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    setShowDDL(false);
    setShowDML(false);
    setDdlContent('');
    setDmlContent('');
    setSelectedColumns([]);
    
    // 이미 로드된 컬럼 정보가 있으면 다시 로드하지 않음
    if (tableColumns[tableName]) {
      return;
    }
    
    setIsLoadingColumns(true);
    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      const response = await fetchFn(`${API_URL}/tables/${tableName}/columns`);
      const data = await response.json();
      
      if (data.success) {
        setTableColumns(prev => ({
          ...prev,
          [tableName]: data.columns
        }));
      }
    } catch (error) {
      console.error('컬럼 로드 오류:', error);
    } finally {
      setIsLoadingColumns(false);
    }
  };

  // 컬럼 선택/해제
  const toggleColumnSelect = (columnName) => {
    setSelectedColumns(prev => {
      if (prev.includes(columnName)) {
        return prev.filter(col => col !== columnName);
      } else {
        return [...prev, columnName];
      }
    });
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedColumns.length === filteredColumns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(filteredColumns.map(col => col.name));
    }
  };

  // DML 생성
  const generateDML = () => {
    if (selectedColumns.length === 0) {
      setDmlContent('컬럼을 하나 이상 선택해주세요.');
      return;
    }

    let dml = '';
    const cols = selectedColumns.join(', ');

    if (dmlType === 'insert') {
      const values = selectedColumns.map(() => '?').join(', ');
      dml = `INSERT INTO ${selectedTable} (${cols})\nVALUES (${values});`;
    } else if (dmlType === 'select') {
      dml = `SELECT ${cols}\nFROM ${selectedTable}\nWHERE condition;`;
    } else if (dmlType === 'update') {
      const sets = selectedColumns.map(col => `${col} = ?`).join(',\n  ');
      dml = `UPDATE ${selectedTable}\nSET\n  ${sets}\nWHERE condition;`;
    }

    setDmlContent(dml);
  };

  // DML 타입 변경 시 자동 재생성
  React.useEffect(() => {
    if (showDML && selectedColumns.length > 0) {
      generateDML();
    }
    // eslint-disable-next-line
  }, [dmlType, selectedColumns]);

  // DDL 조회
  const handleShowDDL = async () => {
    if (showDDL && ddlContent) {
      setShowDDL(false);
      return;
    }

    setIsLoadingDDL(true);
    setShowDDL(true);
    setShowDML(false);
    
    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      const response = await fetchFn(`${API_URL}/tables/${selectedTable}/ddl`);
      const data = await response.json();
      
      if (data.success) {
        setDdlContent(data.ddl);
      }
    } catch (error) {
      console.error('DDL 로드 오류:', error);
    } finally {
      setIsLoadingDDL(false);
    }
  };

  // DML 조회
  const handleShowDML = async () => {
    if (showDML) {
      setShowDML(false);
      return;
    }

    // 전체 컬럼 선택
    if (selectedColumns.length === 0 && tableColumns[selectedTable]) {
      const allColumns = tableColumns[selectedTable].map(col => col.name);
      setSelectedColumns(allColumns);
    }

    setShowDML(true);
    setShowDDL(false);
  };

  // 클립보드 복사
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'ddl') {
        setCopiedDDL(true);
        setTimeout(() => setCopiedDDL(false), 2000);
      } else {
        setCopiedDML(true);
        setTimeout(() => setCopiedDML(false), 2000);
      }
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
    }
  };

  // 파일 다운로드
  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 연결 해제
  const handleDisconnect = async () => {
    try {
      const fetchFn = TEST_MODE ? mockFetch : fetch;
      await fetchFn(`${API_URL}/disconnect`, { method: 'POST' });
      setIsConnected(false);
      setTables([]);
      setTableColumns({});
      setSelectedTable(null);
      setConnectionMessage('');
    } catch (error) {
      console.error('연결 해제 오류:', error);
    }
  };

  const filteredTables = tables;

  const filteredColumns = selectedTable && tableColumns[selectedTable]
    ? tableColumns[selectedTable].filter(column =>
        column.name.toLowerCase().includes(columnSearchTerm.toLowerCase()) ||
        (column.comment && column.comment.toLowerCase().includes(columnSearchTerm.toLowerCase()))
      )
    : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 상단 DB 연결 정보 */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">PostgreSQL Table Viewer</h1>
          {TEST_MODE && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
              테스트 모드
            </span>
          )}
          {isConnected && (
            <div className="ml-auto flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-sm text-green-600 font-medium">연결됨</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Host (예: localhost)"
            value={dbInfo.host}
            onChange={(e) => setDbInfo({...dbInfo, host: e.target.value})}
            disabled={isConnected}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <input
            type="text"
            placeholder="Port (예: 5432)"
            value={dbInfo.port}
            onChange={(e) => setDbInfo({...dbInfo, port: e.target.value})}
            disabled={isConnected}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <input
            type="text"
            placeholder="Database"
            value={dbInfo.database}
            onChange={(e) => setDbInfo({...dbInfo, database: e.target.value})}
            disabled={isConnected}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <input
            type="text"
            placeholder="Username"
            value={dbInfo.username}
            onChange={(e) => setDbInfo({...dbInfo, username: e.target.value})}
            disabled={isConnected}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <input
            type="password"
            placeholder="Password"
            value={dbInfo.password}
            onChange={(e) => setDbInfo({...dbInfo, password: e.target.value})}
            disabled={isConnected}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {!isConnected ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  연결 중...
                </>
              ) : (
                '연결'
              )}
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              연결 해제
            </button>
          )}
        </div>
        
        {connectionMessage && (
          <div className={`mt-3 p-2 rounded flex items-center gap-2 ${
            isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {isConnected ? (
              <CheckCircle size={18} />
            ) : (
              <XCircle size={18} />
            )}
            <span className="text-sm">{connectionMessage}</span>
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 왼쪽 테이블 목록 */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="테이블 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!isConnected}
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {isLoadingTables ? (
              <div className="flex items-center justify-center p-8">
                <Loader className="animate-spin text-blue-600" size={32} />
              </div>
            ) : (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
                  TABLES ({filteredTables.length})
                </div>
                {filteredTables.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-sm">
                    {isConnected ? '테이블이 없습니다' : '데이터베이스에 연결하세요'}
                  </div>
                ) : (
                  filteredTables.map((table) => (
                    <button
                      key={table}
                      onClick={() => handleTableSelect(table)}
                      title={table}
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        selectedTable === table
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Table size={16} />
                      <span className="flex-1 truncate">{table}</span>
                      {selectedTable === table && <ChevronRight size={16} />}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* 중간 컬럼 정보 영역 */}
        <div className="flex-1 overflow-auto p-6">
          {selectedTable ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{selectedTable}</h2>
                  <p className="text-gray-500">테이블 컬럼 정보</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="컬럼명 또는 코멘트 검색..."
                      value={columnSearchTerm}
                      onChange={(e) => setColumnSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleShowDDL}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                  >
                    {showDDL ? 'DDL 숨기기' : 'DDL 보기'}
                  </button>
                  <button
                    onClick={handleShowDML}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    {showDML ? 'DML 숨기기' : 'DML 보기'}
                  </button>
                </div>
              </div>
              
              {isLoadingColumns ? (
                <div className="flex items-center justify-center p-12">
                  <Loader className="animate-spin text-blue-600" size={48} />
                </div>
              ) : showDDL ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">DDL (CREATE TABLE)</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(ddlContent, 'ddl')}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        {copiedDDL ? <Check size={16} /> : <Copy size={16} />}
                        {copiedDDL ? '복사됨!' : '복사'}
                      </button>
                      <button
                        onClick={() => downloadFile(ddlContent, `${selectedTable}_ddl.sql`)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download size={16} />
                        다운로드
                      </button>
                    </div>
                  </div>
                  {isLoadingDDL ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader className="animate-spin text-purple-600" size={32} />
                    </div>
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono border">
                      {ddlContent}
                    </pre>
                  )}
                </div>
              ) : showDML ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-800">DML 생성</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDmlType('insert')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            dmlType === 'insert' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          INSERT
                        </button>
                        <button
                          onClick={() => setDmlType('select')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            dmlType === 'select' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          SELECT
                        </button>
                        <button
                          onClick={() => setDmlType('update')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            dmlType === 'update' 
                              ? 'bg-orange-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          UPDATE
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(dmlContent, 'dml')}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                      >
                        {copiedDML ? <Check size={16} /> : <Copy size={16} />}
                        {copiedDML ? '복사됨!' : '복사'}
                      </button>
                      <button
                        onClick={() => downloadFile(dmlContent, `${selectedTable}_${dmlType}.sql`)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download size={16} />
                        다운로드
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-900">
                        선택된 컬럼: {selectedColumns.length}개
                      </span>
                      <button
                        onClick={toggleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {selectedColumns.length === filteredColumns.length ? '전체 해제' : '전체 선택'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredColumns.map((column) => (
                        <button
                          key={column.name}
                          onClick={() => toggleColumnSelect(column.name)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedColumns.includes(column.name)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {column.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono border">
                    {dmlContent || '컬럼을 선택하면 자동으로 DML이 생성됩니다.'}
                  </pre>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectedColumns.length === filteredColumns.length && filteredColumns.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          컬럼명
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          타입
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          키
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          NULL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          기본값
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          코멘트
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredColumns.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                            검색 결과가 없습니다
                          </td>
                        </tr>
                      ) : (
                        filteredColumns.map((column, index) => (
                          <tr 
                            key={index} 
                            className={`hover:bg-gray-50 cursor-pointer ${
                              selectedColumns.includes(column.name) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleColumnSelect(column.name)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedColumns.includes(column.name)}
                                onChange={() => toggleColumnSelect(column.name)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900">{column.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {column.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {column.key && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  column.key === 'PRI' ? 'bg-yellow-100 text-yellow-800' :
                                  column.key === 'UNI' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {column.key}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                column.null === 'YES' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {column.null}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {column.default || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={column.comment || '-'}>
                              {column.comment || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <Table size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg">
                  {isConnected ? '왼쪽에서 테이블을 선택하세요' : '데이터베이스에 먼저 연결하세요'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}