import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert } from '@/components';

const resetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ResetPasswordEnterEmail = () => {
  const { currentLayout } = useLayout();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setStatus }) => {
      setLoading(true);
      try {
        // TODO: Implement API call to send password reset email
        // For now, navigate to check-email page
        const path = currentLayout?.name === 'auth-branded'
          ? '/auth/reset-password/check-email'
          : '/auth/classic/reset-password/check-email';
        navigate(path);
      } catch (error: any) {
        setStatus(error?.message || 'Failed to send password reset email');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form className="card-body flex flex-col gap-5 p-10" onSubmit={formik.handleSubmit}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Your Email</h3>
          <span className="text-2sm text-gray-700">Enter your email to reset password</span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label font-normal text-gray-900">Email</label>
          <input
            className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
            type="email"
            placeholder="email@email.com"
            {...formik.getFieldProps('email')}
          />
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1 break-words max-w-full">
              {formik.errors.email}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Continue'}
          <KeenIcon icon="black-right" />
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordEnterEmail };
