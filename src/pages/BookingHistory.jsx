import React, { useEffect, useState } from "react";
import { Layout, Table, DatePicker, Row, Col, Button, Modal } from "antd";
import { toast } from "react-toastify";
import { getBookingCheckedOut } from "../utils/api";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Content } = Layout;

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(dayjs());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const bookingRes = await getBookingCheckedOut();

        if (Array.isArray(bookingRes)) {
          setBookings(bookingRes);
          setFilteredBookings(bookingRes);
        } else if (bookingRes?.data && Array.isArray(bookingRes.data)) {
          setBookings(bookingRes.data);
          setFilteredBookings(bookingRes.data);
        } else {
          setBookings([]);
          setFilteredBookings([]);
        }
      } catch (err) {
        toast.error("Lỗi khi tải lịch sử booking!");
        setBookings([]);
        setFilteredBookings([]);
      }
    };
    fetchBookings();
  }, []);

    const translateField = (field, value) => {
        const mapping = {
            paymentMethod: {
            cash: "Tiền mặt",
            banking: "Chuyển khoản",
            },
            stayType: {
            daily: "Cả ngày",
            overnight: "Qua đêm",
            hourly: "Ngắn hạn",
            },
            status: {
            checkedOut: "Đã trả phòng",
            booked: "Đã đặt",
            cancelled: "Đã hủy",
            checkingIn: "Đang ở",
            },
        };
    
        return mapping[field]?.[value] || value;
    };

  const handleSearch = () => {
    if (startDate && endDate) {
      const filtered = bookings.filter((b) => {
        const checkOut = dayjs(b.checkOutDate);
        return (
          checkOut.isSameOrAfter(startDate.startOf("day")) &&
          checkOut.isSameOrBefore(endDate.endOf("day"))
        );
      });
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  };

  const columns = [
    { title: "Tên khách", dataIndex: "customerName", key: "customerName" },
    { title: "Phòng", dataIndex: ["roomId", "roomNumber"], key: "room" },
    {
      title: "Check-in",
      dataIndex: "checkInDate",
      key: "checkInDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Check-out",
      dataIndex: "checkOutDate",
      key: "checkOutDate",
      render: (val) => dayjs(val).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (val) => val.toLocaleString() + " VNĐ",
    },
  ];

  return (
    <Content style={{ margin: "16px" }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 8, minHeight: 500 }}>
        <h2 style={{ marginBottom: 20 }}>Lịch sử đặt phòng</h2>

        {/* Thanh lọc theo từ ngày -> đến ngày */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col>
            <DatePicker
              placeholder="Từ ngày"
              value={startDate}
              onChange={setStartDate}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <DatePicker
              placeholder="Đến ngày"
              value={endDate}
              onChange={setEndDate}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Col>
          <Col>
            <Button
              onClick={() => {
                setStartDate(null);
                setEndDate(dayjs());
                setFilteredBookings(bookings);
              }}
            >
              Reset
            </Button>
          </Col>
        </Row>

        <Table
            rowKey="_id"
            columns={columns}
            dataSource={Array.isArray(filteredBookings) ? filteredBookings : []}
            pagination={{ pageSize: 10 }}
            onRow={(record) => {
                return {
                onClick: () => setSelectedBooking(record),
                };
            }}
        />

        <Modal
            visible={!!selectedBooking}
            title="Chi tiết lịch sử đặt phòng"
            footer={null}
            onCancel={() => setSelectedBooking(null)}
            >
            {selectedBooking && (
            <>
                <p><b>Tên khách:</b> {selectedBooking.customerName}</p>
                <p><b>CCCD:</b> {selectedBooking.citizenId}</p>
                <p><b>Phòng:</b> {selectedBooking.roomId?.roomNumber}</p>
                <p><b>Check-in:</b> {dayjs(selectedBooking.checkInDate).format("DD/MM/YYYY HH:mm")}</p>
                <p><b>Check-out:</b> {dayjs(selectedBooking.checkOutDate).format("DD/MM/YYYY HH:mm")}</p>
                <p><b>Phương thức thanh toán:</b> {translateField("paymentMethod", selectedBooking.paymentMethod)}</p>
                <p><b>Loại hình thuê:</b> {translateField("stayType", selectedBooking.stayType)}</p>
                <p><b>Trạng thái:</b> {translateField("status", selectedBooking.status)}</p>
                <p><b>Tổng tiền:</b> {selectedBooking.totalPrice.toLocaleString()} VNĐ</p>
            </>
            )}
        </Modal>
      </div>
    </Content>
  );
};

export default BookingHistory;
