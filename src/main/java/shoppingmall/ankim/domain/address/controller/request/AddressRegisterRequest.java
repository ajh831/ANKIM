package shoppingmall.ankim.domain.address.controller.request;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import shoppingmall.ankim.domain.address.service.request.AddressRegisterServiceRequest;

@Getter
@NoArgsConstructor
public class AddressRegisterRequest {

    private String addressName; // 배송지명( 선택 )

    @NotNull(message = "우편번호를 입력해주세요.")
    private Integer zipCode; // 우편번호

    @NotBlank(message = "주소를 선택해주세요.")
    private String addressMain; // 주소

    @NotBlank(message = "상세 주소를 입력해주세요.")
    private String addressDetail; // 상세주소

    @Builder
    public AddressRegisterRequest(Integer zipCode, String addressMain, String addressDetail) {
        this.zipCode = zipCode;
        this.addressMain = addressMain;
        this.addressDetail = addressDetail;
    }

    public AddressRegisterServiceRequest toServiceRequest() {
        return AddressRegisterServiceRequest.builder()
                .zipCode(this.zipCode)
                .addressMain(this.addressMain)
                .addressDetail(this.addressDetail)
                .build();
    }
}
