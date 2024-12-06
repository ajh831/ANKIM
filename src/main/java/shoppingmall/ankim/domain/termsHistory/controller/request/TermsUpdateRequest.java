package shoppingmall.ankim.domain.termsHistory.controller.request;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TermsUpdateRequest {

    private Long terms_no;
    private Long terms_hist_no;
    private String terms_hist_agreeYn;

    @Builder
    public TermsUpdateRequest(Long terms_no, Long terms_hist_no, String terms_hist_agreeYn) {
        this.terms_no = terms_no;
        this.terms_hist_no = terms_hist_no;
        this.terms_hist_agreeYn = terms_hist_agreeYn;
    }

    TermsUpdateRequest toServiceRequest() {
        return TermsUpdateRequest.builder()
                .terms_no(terms_no)
                .terms_hist_no(terms_hist_no)
                .terms_hist_agreeYn(terms_hist_agreeYn)
                .build();
    }

}