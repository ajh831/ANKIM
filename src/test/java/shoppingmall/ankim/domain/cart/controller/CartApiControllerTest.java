package shoppingmall.ankim.domain.cart.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import shoppingmall.ankim.domain.cart.controller.request.AddToCartRequest;
import shoppingmall.ankim.domain.cart.service.CartService;
import shoppingmall.ankim.domain.image.service.S3Service;
import shoppingmall.ankim.domain.member.entity.Member;
import shoppingmall.ankim.domain.security.service.JwtTokenProvider;
import shoppingmall.ankim.factory.MemberFactory;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//@WebMvcTest(CartApiController.class)
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // CSRF 비활성화
@Import({JwtTokenProvider.class})
@Transactional
@TestPropertySource(properties = "spring.sql.init.mode=never")
class CartApiControllerTest {

    @Autowired
    EntityManager em;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private CartService cartService;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private S3Service s3Service;

    @Test
    @DisplayName("장바구니에 상품 담기를 성공한다.")
    @WithMockUser(username = "test@ankim.com", roles = {"USER"})
    void addToCart_Success() throws Exception {
        // given
        Member member = MemberFactory.createMember(em, "test@ankim.com");
        em.flush();
        em.clear();

        AddToCartRequest request = new AddToCartRequest();
        request.setProductNo(1L);
        request.setOptionValueNoList(List.of(1L, 3L));
        request.setQty(2);

        List<AddToCartRequest> requests = new ArrayList<>();
        requests.add(request);

        // when & then
        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requests))) // 요청 본문 설정
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value("장바구니에 상품이 담겼습니다.")); // 응답 메시지 확인
    }

    @Test
    @DisplayName("회원이 장바구니 페이지에 들어가서 장바구니에 담은 상품들을 확인할 수 있다.")
    @WithMockUser(username = "test@ankim.com", roles = {"USER"})
    void getCartItems_Success() throws Exception {
        // given
        MemberFactory.createMember(em, "test@ankim.com");
        em.flush();
        em.clear();

        // when & then
        mockMvc.perform(get("/api/cart")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}