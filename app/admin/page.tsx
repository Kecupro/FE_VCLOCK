"use client";


import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Button, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { OrderApiResponse, RecentOrderDisplay, RevenueItem, ProductSummary, ProductApiResponse, IProduct } from '@/app/(site)/cautrucdata';
import axios from 'axios';
import {
  FaBoxes, FaFileAlt, FaTicketAlt,
  FaClipboardList, FaUsers, FaBuilding, FaNewspaper, FaBox,
} from 'react-icons/fa';
import Image from 'next/image';

export default function AdminDashboardPage() {

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCatePro, setTotalCatePro] = useState(0);
  const [totalCateNews, setTotalCateNews] = useState(0);
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalVouchers, setTotalVouchers] = useState(0);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [orders, setOrders] = useState<RecentOrderDisplay[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<RevenueItem[]>([]);
  const [totalOrdersInSelectedMonth, setTotalOrdersInSelectedMonth] = useState<number>(0);

  const [topSellingProducts, setTopSellingProducts] = useState<ProductSummary[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<ProductSummary[]>([]);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
  const fetchData = async () => { 
    try {
      const totalResUsers = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/user`, {});
      setTotalUsers(totalResUsers.data.total || 0);

      const totalResOrders = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/order`, {});
      setTotalOrders(totalResOrders.data.totalCount || 0);

      const totalResNews = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/news`, {});
      setTotalNews(totalResNews.data.total || 0);

      const totalResProducts = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/product`, {});
      setTotalProducts(totalResProducts.data.total || 0);

      const productsRes = await axios.get<ProductApiResponse>(`http://localhost:3000/api/admin/product`, {
        params: { page: 1, limit: 1000 }
      });
      const products: IProduct[] = productsRes.data.list || [];

      const sortedBySold = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
      const top3Selling = sortedBySold.slice(0, 3).map(p => ({
        _id: p._id,
        name: p.name,
        main_image: p.main_image,
        quantity: p.quantity,
        sold: p.sold || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      setTopSellingProducts(top3Selling);

      const sortedByDate = [...products].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const top3Recent = sortedByDate.slice(0, 3).map(p => ({
        _id: p._id,
        name: p.name,
        main_image: p.main_image,
        quantity: p.quantity,
        sold: p.sold || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      setInventoryProducts(top3Recent);

      const totalResCatePro = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/categoryProduct`, {});
      setTotalCatePro(totalResCatePro.data.total || 0);

      const totalResCateNews = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/categoryNews`, {});
      setTotalCateNews(totalResCateNews.data.total || 0);

      const totalResBrands = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/brand`, {});
      setTotalBrands(totalResBrands.data.total || 0);

      const totalResVouchers = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/voucher`, {});
      setTotalVouchers(totalResVouchers.data.total || 0);
    } catch (err) {
      console.error('Lỗi khi fetch dữ liệu dashboard:', err);
    }
  };

  fetchData();
  }, []);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const allRes = await axios.get<OrderApiResponse>(`http://localhost:3000/api/admin/order`, {
        params: { page: 1, limit: 1000, sort: 'newest' }
      });

      const allOrders = allRes.data.list || [];
      const revenueByMonth: RevenueItem[] = Array.from({ length: 12 }, (_, i) => ({
        name: `Th${i + 1}`,
        value: 0,
      }));

      allOrders.forEach((order) => {
        const createdAt = new Date(order.created_at);
        const isDelivered = order.order_status == 'hoanThanh';
        const isPaid = order.payment_status == 'thanhToan';

        if (createdAt.getFullYear() == selectedYear && isDelivered && isPaid) {
          const month = createdAt.getMonth();
          revenueByMonth[month].value += order.total_amount || 0;
        }
      });

      setMonthlyRevenue(revenueByMonth);
      setOrders(
        allOrders.map((o) => ({
          customerName: o.user_id?.fullName || o.user_id?.username || '...',
          orderId: o._id,
          paymentMethod: o.payment_method_id?.name || '...',
          totalAmount: (o.total_amount || 0).toLocaleString(),
          status: o.order_status,
          paymentStatus: o.payment_status,
          created_at: o.created_at
        }))
      );
    } catch (err) {
      console.error('Lỗi khi fetch đơn hàng:', err);
    }
  };

  fetchOrders();
  }, [selectedYear]);

  useEffect(() => {
  const filtered = orders.filter((order) => {
    const date = new Date(order.created_at);
    return date.getMonth() == selectedMonth && date.getFullYear() == selectedYear;
  });
  setTotalOrdersInSelectedMonth(filtered.length);
  }, [selectedMonth, orders, selectedYear]);

  const chartData = monthlyRevenue;
  const totalRevenue = chartData.reduce((sum, entry) => sum + entry.value, 0);
  const [showBarChart, setShowBarChart] = useState(true);

  const toggleChart = () => {
    setShowBarChart(prevState => !prevState);
  };

  const filteredOrdersByMonth = orders.filter((order) => {
  const date = new Date(order.created_at);
  return date.getMonth() == selectedMonth && date.getFullYear() == selectedYear;
  });

  // ! Phân trang đơn hàng
  const ordersPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(filteredOrdersByMonth.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const displayRecentOrders = filteredOrdersByMonth.slice(indexOfFirstOrder, indexOfLastOrder);
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  // ! End Phân trang đơn hàng

  // ! < == Status Order + Payment ==>
  const statusMap: Record<string, string> = {
    choXuLy: 'Chờ xử lý',
    dangXuLy: 'Đang xử lý',
    dangGiaoHang: 'Đang giao hàng',
    daGiaoHang: 'Đã giao hàng',
    daHuy: 'Đã hủy',
    hoanTra: 'Hoàn trả',
    hoanThanh: 'Đã hoàn tất',
  };

  const paymentStatusMap: Record<string, string> = {
    chuaThanhToan: 'Chưa thanh toán',
    thanhToan: 'Đã thanh toán',
    choHoanTien: 'Chờ hoàn tiền',
    hoanTien: 'Đã hoàn tiền',
  };
  // ! < == End Status Order ==>

  const formatNumber = (value: number): string => {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toString();
  };

  return (
  <Container fluid>
    <h2 className="mt-3 mb-4">Trang chủ</h2>

    <Row className="mb-4">

      <Col md={3}>
      <Nav.Link href="/admin/users" className="card-link">
        <Card className="overview-card">
          <Card.Body className='overview-card-body'>
            <div className="box-overview-card">
              <Card.Title>Tổng người dùng</Card.Title>
              <Card.Text className="value">{totalUsers}</Card.Text>
            </div>
            <div className="icon-overview-card"><FaUsers className="icon" /></div>
          </Card.Body>
        </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/orders" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng đơn hàng</Card.Title>
        <Card.Text className="value">{totalOrders}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaClipboardList className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/news" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng bài tin tức</Card.Title>
        <Card.Text className="value">{totalNews}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaFileAlt className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/products" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng sản phẩm</Card.Title>
        <Card.Text className="value">{totalProducts}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaBoxes className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/categories-product-list" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng danh mục sản phẩm</Card.Title>
        <Card.Text className="value">{totalCatePro}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaBox className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/categories-news-list" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng danh mục tin tức</Card.Title>
        <Card.Text className="value">{totalCateNews}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaNewspaper className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

    {/* Quản lý thương hiệu */}
      <Col md={3}>
     <Nav.Link href="/admin/brands" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng thương hiệu</Card.Title>
        <Card.Text className="value">{totalBrands}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaBuilding className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>

      <Col md={3}>
     <Nav.Link href="/admin/vouchers" className="card-link">
      <Card className="overview-card">
       <Card.Body className='overview-card-body'>
        <div className="box-overview-card">
        <Card.Title>Tổng mã giảm giá</Card.Title>
        <Card.Text className="value">{totalVouchers}</Card.Text>
        </div>
        <div className="icon-overview-card"><FaTicketAlt className="icon" /></div>
       </Card.Body>
      </Card>
      </Nav.Link>
      </Col>
    </Row>

    <Row>
      <Col md={8}>
        <Card className="mb-4 chart-card">
          <Card.Body>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <Card.Title className="total-revenue-display">
                Tổng doanh thu 12 tháng ({selectedYear}): <span>{totalRevenue.toLocaleString()}đ</span>
              </Card.Title>

              <div className="gap-2 chart-controls d-flex align-items-center chart-years">
                <Form.Select
                    size="sm"
                    style={{ width: 'auto' }}
                    value={selectedYear}
                    className='select-month'
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </Form.Select>

                <Button className='buttonChangeChart' size="sm" onClick={toggleChart}>
                  {showBarChart ? 'Xem biểu đồ đường' : 'Xem biểu đồ cột'}
                </Button>
              </div>
            </div>
            <div style={{ height: 718, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              <div style={{ width: '100%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {showBarChart ? (
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                      <Tooltip formatter={(value: number | string) => [formatNumber(Number(value)), 'Tổng']}/>
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                      <Tooltip formatter={(value: number | string) => [formatNumber(Number(value)), 'Tổng']}/>
                      <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="mb-4 recent-sales-card">
          <Card.Body>
            <div className="mb-2 d-flex justify-content-between align-items-center">
              <Card.Title className="mb-2">Đơn hàng theo tháng</Card.Title>
              <Card.Text className="gap-2 mb-2 text-muted d-flex align-items-center">
                <span>Chọn tháng:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-auto select-month form-select form-select-sm d-inline-block"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
              </Card.Text>
            </div>
                
              <Card.Text className="mb-3 text-muted">
                Trong tháng <strong>{selectedMonth + 1}</strong>, có <strong style={{color: "var(--accent-color)"}}>{totalOrdersInSelectedMonth}</strong> đơn hàng.
              </Card.Text>

              {displayRecentOrders.map((order, index) => (
                <div key={index} className="mb-2 order-item">
                  <p className="order-customer-name"><strong>{order.customerName}</strong></p>
                  <p className="mb-0">Mã đơn hàng: <span className="text-muted">{order.orderId}</span></p>
                  <p className="mb-0">Tổng tiền: <span className="text-price-order">{order.totalAmount}đ</span></p>
                  <p className="mb-0">Trạng thái đơn hàng:
                    <span
                      className={`order-status-badge ${
                        order.status == 'choXuLy' ? 'status-choXuLy' :
                        order.status == 'dangXuLy' ? 'status-dangXuLy' :
                        order.status == 'dangGiaoHang' ? 'status-dangGiaoHang' :
                        order.status == 'daGiaoHang' ? 'status-daGiaoHang' :
                        order.status == 'hoanTra' ? 'status-hoanTra' :
                        order.status == 'hoanThanh' ? 'status-hoanThanh' :
                        'status-daHuy'
                      }`}
                    >
                      {statusMap[order.status] || order.status}
                    </span>
                  </p>
                  <p className="mb-0">Phương thức thanh toán: <span className="text-muted">{order.paymentMethod}</span></p>
                  <p className="mb-0">Trạng thái thanh toán:
                    <span className="text-muted">
                      <span className={`payment-status-badge ${
                        order.paymentStatus == 'chuaThanhToan' ? 'status-chuaThanhToan' :
                        order.paymentStatus == 'thanhToan' ? 'status-thanhToan' :
                        order.paymentStatus == 'choHoanTien' ? 'status-choHoanTien' :
                        'status-hoanTien'
                      }`}>
                        {paymentStatusMap[order.paymentStatus] || order.paymentStatus}
                      </span>

                    </span>
                  </p>
                  <p className="mb-0">Ngày tạo: <span className="text-muted">{new Date(order.created_at!).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></p>
                </div>
              ))}
              <div className="mt-3 d-flex justify-content-between align-items-center">
                  <span>Trang {currentPage} trong {totalPages}</span>
                  <div>
                      <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          onClick={handlePrevPage}
                          disabled={currentPage == 1}
                      >
                          Trước
                      </Button>
                      <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage == totalPages}
                      >
                          Sau
                      </Button>
                  </div>
              </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <Row className="mt-0">
      <Col md={6}>
        <Card className="mb-4 sp-dashboard-card">
          <Card.Body>
            <Card.Title className="mb-3">Sản phẩm bán chạy</Card.Title>
            {topSellingProducts.map(product => (
              <div key={product._id} className="mb-3 d-flex align-items-center">
                <Image
                  src={`/images/product/${product.main_image.image}`}
                  alt={product.name}
                  width={60}
                  height={60}
                  style={{ objectFit: 'cover', marginRight: '12px', borderRadius: '8px' }}
                />
                <div>
                  <h6 className="mb-1">{product.name}</h6>
                  <p className="mb-0 text-muted">Đã bán: <strong style={{color: "var(--accent-color)"}}>{product.sold}</strong></p>
                  <p className="mb-0 text-muted">Ngày cập nhật: {new Date(product.updated_at!).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
          
      <Col md={6}>
        <Card className="mb-4 sp-dashboard-card">
          <Card.Body>
            <Card.Title className="mb-3">Sản phẩm tồn kho gần đây</Card.Title>
            {inventoryProducts.map(product => (
              <div key={product._id} className="mb-3 d-flex align-items-center">
                <Image
                  src={`/images/product/${product.main_image.image}`}
                  alt={product.name}
                  width={60}
                  height={60}
                  style={{ objectFit: 'cover', marginRight: '12px', borderRadius: '8px' }}
                />
                <div>
                  <h6 className="mb-1">{product.name}</h6>
                  <p className="mb-0 text-muted">Tồn kho: <strong style={{color: "var(--accent-color)"}}>{product.quantity}</strong></p>
                  <p className="mb-0 text-muted">Ngày thêm: {new Date(product.created_at!).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                </div>
              </div>
            ))}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
  );
}