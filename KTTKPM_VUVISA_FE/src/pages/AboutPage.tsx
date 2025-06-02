import React from 'react';
import { FaBookOpen, FaHandshake, FaCheck, FaUserFriends, FaAward, FaBoxOpen } from 'react-icons/fa';
import { RiCustomerService2Fill } from 'react-icons/ri';
import vuvisaIco from '/ico.png';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-red-600 text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-4 py-20 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về VUVISA</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Hành trình kết nối tri thức với cộng đồng, mang đến trải nghiệm mua sắm sách và văn phòng phẩm tốt nhất
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Câu chuyện của chúng tôi</h2>
            <p className="text-gray-600 mb-4">
              VUVISA được thành lập vào năm 2025 với sứ mệnh trở thành nhà sách trực tuyến thông minh hàng đầu Việt Nam. 
              Xuất phát từ niềm đam mê với sách và mong muốn lan tỏa văn hóa đọc, chúng tôi đã xây dựng một 
              nền tảng trực tuyến hiện đại kết hợp với không gian nhà sách thực tế để mang đến trải nghiệm mua sắm 
              hoàn hảo nhất.
            </p>
            <p className="text-gray-600 mb-4">
              Từ những bước đi đầu tiên với chỉ vài trăm đầu sách, VUVISA ngày nay đã phát triển thành một hệ sinh thái 
              với hơn 20,000 đầu sách đa dạng thể loại, từ sách trong nước đến sách nước ngoài, cùng hàng ngàn sản phẩm 
              văn phòng phẩm chất lượng cao.
            </p>
            <p className="text-gray-600">
              Chúng tôi tin rằng sách là cánh cửa mở ra thế giới tri thức vô tận, và VUVISA tự hào là người gác cổng 
              đồng hành cùng độc giả trên hành trình khám phá đó.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 md:-inset-6 rounded-xl bg-red-100 transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80" 
                alt="Về VUVISA" 
                className="relative rounded-lg shadow-lg w-full h-auto z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                <FaBookOpen className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Đam mê tri thức</h3>
              <p className="text-gray-600">
                Chúng tôi đam mê sách và tin vào sức mạnh của tri thức. VUVISA cam kết mang đến những đầu sách 
                giá trị, khơi dậy niềm đam mê đọc sách cho mọi người.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                <RiCustomerService2Fill className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Dịch vụ xuất sắc</h3>
              <p className="text-gray-600">
                Trải nghiệm khách hàng là ưu tiên hàng đầu. Chúng tôi không ngừng cải tiến dịch vụ, từ giao diện 
                mua sắm đến chăm sóc khách hàng và giao hàng nhanh chóng.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-full mb-4">
                <FaHandshake className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Trung thực & Minh bạch</h3>
              <p className="text-gray-600">
                Chúng tôi xây dựng mọi mối quan hệ dựa trên sự trung thực, minh bạch trong kinh doanh và 
                giao tiếp với khách hàng, đối tác và nhân viên.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2 bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 bg-red-100 rounded-full mr-4">
                <FaCheck className="text-red-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Sứ mệnh</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sứ mệnh của VUVISA là trở thành cầu nối tri thức, mang đến cho độc giả Việt Nam những cuốn sách chất lượng
              với trải nghiệm mua sắm tuyệt vời nhất. Chúng tôi cam kết:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Cung cấp đa dạng đầu sách từ trong nước đến quốc tế</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Khuyến khích văn hóa đọc trong cộng đồng</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Đảm bảo dịch vụ mua sắm thuận tiện, an toàn và đáng tin cậy</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Hỗ trợ các tác giả và nhà xuất bản trong nước</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 bg-gray-50 p-8 rounded-lg">
            <div className="flex items-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 bg-red-100 rounded-full mr-4">
                <FaAward className="text-red-600 text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tầm nhìn</h2>
            </div>
            <p className="text-gray-600 mb-4">
              VUVISA hướng đến tầm nhìn trở thành nhà sách thông minh hàng đầu tại Việt Nam, nơi công nghệ gặp gỡ tri thức. 
              Chúng tôi mong muốn:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Xây dựng hệ sinh thái tri thức toàn diện kết hợp công nghệ hiện đại</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Nâng cao trải nghiệm mua sắm thông qua công nghệ AI và cá nhân hóa</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Mở rộng hệ thống nhà sách kết hợp không gian văn hóa trên toàn quốc</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                <span>Trở thành đối tác tin cậy của các tác giả, nhà xuất bản và độc giả</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Tại sao chọn VUVISA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <FaBoxOpen className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Đa dạng sản phẩm</h3>
              <p className="text-gray-600">
                Hơn 20,000 đầu sách và sản phẩm văn phòng phẩm đa dạng từ các thương hiệu uy tín trong và ngoài nước.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <FaHandshake className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Sản phẩm chính hãng</h3>
              <p className="text-gray-600">
                100% sản phẩm được nhập từ các nhà xuất bản và nhà cung cấp chính hãng, đảm bảo chất lượng.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <RiCustomerService2Fill className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Dịch vụ khách hàng 24/7</h3>
              <p className="text-gray-600">
                Đội ngũ hỗ trợ khách hàng nhiệt tình, sẵn sàng giải đáp mọi thắc mắc và hỗ trợ bạn 24/7.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <FaAward className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Ưu đãi hấp dẫn</h3>
              <p className="text-gray-600">
                Thường xuyên có các chương trình khuyến mãi, flash sale và voucher giảm giá hấp dẫn.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <FaUserFriends className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Cộng đồng độc giả</h3>
              <p className="text-gray-600">
                Tham gia cộng đồng yêu sách của VUVISA với các sự kiện, hội thảo và giao lưu cùng tác giả thường xuyên.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-14 w-14 bg-red-100 rounded-full mb-4">
                <FaCheck className="text-red-600 text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Thanh toán an toàn</h3>
              <p className="text-gray-600">
                Đa dạng phương thức thanh toán an toàn, bảo mật với nhiều lựa chọn phù hợp nhu cầu của bạn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team Section */}
      <div className="container mx-auto px-4 py-16">        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Đội ngũ sáng lập
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gặp gỡ những con người đam mê, tài năng và tận tâm đứng sau thành công của VUVISA          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mb-4 relative">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto border-4 border-red-100">
                <img 
                  src="https://i.pinimg.com/736x/32/0b/b0/320bb0bbe37784df54de3392eeed93c8.jpg" 
                  alt="CEO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nguyễn Tấn Lộc</h3>
            <p className="text-red-600 font-medium mb-2">Thành Viên</p>
            <p className="text-gray-600 text-sm">
              Với hơn 10 năm kinh nghiệm trong ngành xuất bản, anh Lộc mang đến tầm nhìn chiến lược và đam mê sách.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto border-4 border-red-100">
                <img 
                  src="https://i.pinimg.com/736x/b1/9d/84/b19d84d1c539d5f7984d517e840a3a70.jpg" 
                  alt="CTO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nguyễn Thế Lực</h3>
            <p className="text-red-600 font-medium mb-2">Thành Viên</p>
            <p className="text-gray-600 text-sm">
              Chuyên gia công nghệ với kinh nghiệm phát triển các nền tảng thương mại điện tử hàng đầu.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto border-4 border-red-100">
                <img 
                  src="https://i.pinimg.com/736x/f0/f7/be/f0f7beb46b0c4e5159497144c56e3090.jpg" 
                  alt="COO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Võ Trần Quốc Bảo</h3>
            <p className="text-red-600 font-medium mb-2">Thành Viên</p>
            <p className="text-gray-600 text-sm">
              Chuyên gia trong lĩnh vực quản lý chuỗi cung ứng và vận hành, mang đến hiệu quả trong mọi hoạt động.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto border-4 border-red-100">
                <img 
                  src="https://i.pinimg.com/736x/48/8c/76/488c7600c81168967bc1d3cd8865948f.jpg" 
                  alt="CIO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Nguyễn Đa Nghiêm</h3>
            <p className="text-red-600 font-medium mb-2">Thành Viên</p>
            <p className="text-gray-600 text-sm">
              Chuyên gia công nghệ thông tin với kinh nghiệm phát triển các hệ thống quản lý dữ liệu thông minh.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mt-8">
          <div className="text-center mx-auto">
            <div className="mb-4">
              <div className="w-48 h-48 rounded-full overflow-hidden mx-auto border-4 border-red-100">
                <img 
                  src="https://i.pinimg.com/736x/12/c6/56/12c6565d4ae244b79d3b1072e97ae4db.jpg" 
                  alt="CMO"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Võ Trường Khang</h3>
            <p className="text-red-600 font-medium mb-2">Trưởng Nhóm</p>
            <p className="text-gray-600 text-sm">
              Với nền tảng vững chắc về truyền thông và marketing, anh Khang mang đến những chiến lược tiếp thị sáng tạo.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <img src={vuvisaIco} className="h-12 mr-3" alt="VUVISA Logo" />
            <span className="text-3xl font-bold">VUVISA</span>
          </div>
          <h2 className="text-3xl font-bold mb-6">Hãy trở thành một phần của cộng đồng VUVISA</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Khám phá thế giới sách và văn phòng phẩm chất lượng cao cùng với những ưu đãi hấp dẫn
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/user/register" 
              className="bg-white text-red-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition duration-200"
            >
              Đăng ký ngay
            </a>
            <a 
              href="/category/sach-trong-nuoc" 
              className="bg-transparent hover:bg-red-700 border-2 border-white font-semibold px-8 py-3 rounded-lg transition duration-200"
            >
              Khám phá sách
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
