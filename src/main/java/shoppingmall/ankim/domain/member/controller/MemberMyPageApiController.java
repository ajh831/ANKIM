package shoppingmall.ankim.domain.member.controller;

import lombok.RequiredArgsConstructor;
import org.apache.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import shoppingmall.ankim.domain.member.service.MemberMyPageService;
import shoppingmall.ankim.domain.member.service.MemberService;
import shoppingmall.ankim.domain.security.exception.CookieNotIncludedException;
import shoppingmall.ankim.global.response.ApiResponse;

import static shoppingmall.ankim.global.exception.ErrorCode.COOKIE_NOT_INCLUDED;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/mypage")
public class MemberMyPageApiController {

    private final MemberMyPageService memberMyPageService;

    @PostMapping("/confirm-password") // FIXME 마이 페이지 비밀번호 재확인
    public ApiResponse<String> confirmPassword(
            @RequestParam String password,
            @CookieValue(value = "access", required = false) String access
    ) {
        isExistAccessToken(access);

        memberMyPageService.isValidPassword(access, password);

        return ApiResponse.ok("비밀번호 검증에 성공했습니다.");
    }

    // 쿠키에서 access 토큰이 넘어왔는지 확인하는 것 이므로 컨트롤러 단에 유지
    private static void isExistAccessToken(String access) {
        if (access == null) {
            throw new CookieNotIncludedException(COOKIE_NOT_INCLUDED);
        }
    }

}